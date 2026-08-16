"use server";

import crypto from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/server/rateLimit";
import { logAction } from "@/lib/server/audit";
import { z } from "zod";

const PERSONAL_SESSION_COOKIE = "personalSessionId";
const PERSONAL_SESSION_DURATION_SEC = 60 * 60; // 1 hour
const OTP_EXPIRY_MINUTES = 10;

const emailSchema = z.string().trim().email("Please enter a valid email address.");

function getSecretKey(): string {
  return process.env.SESSION_SECRET || "cerrt-personal-access-secret-key-2026";
}

function signSessionToken(email: string, expiresAt: number): string {
  const payload = `${email}:${expiresAt}`;
  const hmac = crypto
    .createHmac("sha256", getSecretKey())
    .update(payload)
    .digest("hex");
  return `${payload}:${hmac}`;
}

function verifySessionToken(token: string): { email: string; expiresAt: number } | null {
  try {
    const parts = token.split(":");
    if (parts.length !== 3) return null;
    const [email, expiresAtStr, hmac] = parts;
    const expiresAt = Number.parseInt(expiresAtStr, 10);

    if (Number.isNaN(expiresAt) || Date.now() > expiresAt) return null;

    const payload = `${email}:${expiresAt}`;
    const expectedHmac = crypto
      .createHmac("sha256", getSecretKey())
      .update(payload)
      .digest("hex");

    if (crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(expectedHmac))) {
      return { email, expiresAt };
    }
    return null;
  } catch {
    return null;
  }
}

export async function getVerifiedPersonalEmail(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(PERSONAL_SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = verifySessionToken(token);
  return session ? session.email : null;
}

/**
 * Request a 6-digit OTP sent to the reporter's email.
 */
export async function requestOtpAction(email: string): Promise<{ success: boolean; message?: string }> {
  const parseResult = emailSchema.safeParse(email);
  if (!parseResult.success) {
    throw new Error(parseResult.error.issues[0]?.message || "Invalid email address");
  }

  const normalizedEmail = parseResult.data.toLowerCase();

  // Enforce rate limit (3 attempts per 15 mins)
  await checkRateLimit(normalizedEmail, "personal_otp");

  // Check if there are any incidents submitted by this email
  const existingReport = await prisma.incidentReport.findFirst({
    where: { contactEmail: normalizedEmail },
    select: { id: true },
  });

  if (!existingReport) {
    // Return success to avoid email enumeration, but do not generate OTP
    return {
      success: true,
      message: "If an incident report exists for this email, an OTP verification code has been sent.",
    };
  }

  // Generate 6-digit numeric OTP code
  const rawOtpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const otpHash = crypto.createHash("sha256").update(rawOtpCode).digest("hex");
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  try {
    // Invalidate any active OTPs for this email
    await prisma.emailOtp.updateMany({
      where: { email: normalizedEmail, isUsed: false },
      data: { isUsed: true },
    });

    // Store hashed OTP in database
    await prisma.emailOtp.create({
      data: {
        email: normalizedEmail,
        otpHash,
        expiresAt,
      },
    });
  } catch (err) {
    console.error("[PersonalAccess] DB error creating OTP:", err);
    throw new Error("Unable to generate verification code. Please try again in a few moments.");
  }

  // Log in console for development/testing
  console.log(`\n=======================================================`);
  console.log(`🔑 PERSONAL ACCESS OTP FOR ${normalizedEmail}: [ ${rawOtpCode} ]`);
  console.log(`=======================================================\n`);

  await logAction({
    action: "PERSONAL_ACCESS_OTP_REQUEST",
    description: `OTP verification code requested for email: ${normalizedEmail}`,
    actorOverride: { id: null, email: normalizedEmail, name: "Reporter User" },
  });

  return {
    success: true,
    message: "An OTP verification code has been sent to your email.",
  };
}

/**
 * Verify 6-digit OTP code and establish a 1-hour session.
 */
export async function verifyOtpAction(
  email: string,
  code: string
): Promise<{ success: boolean }> {
  const parseResult = emailSchema.safeParse(email);
  if (!parseResult.success) {
    throw new Error("Invalid email address");
  }
  const normalizedEmail = parseResult.data.toLowerCase();

  const trimmedCode = code.trim();
  if (!/^\d{6}$/.test(trimmedCode)) {
    throw new Error("Please enter a valid 6-digit verification code.");
  }

  const otpHash = crypto.createHash("sha256").update(trimmedCode).digest("hex");

  try {
    const otpRecord = await prisma.emailOtp.findUnique({
      where: { otpHash },
    });

    if (
      !otpRecord ||
      otpRecord.email !== normalizedEmail ||
      otpRecord.isUsed ||
      otpRecord.expiresAt < new Date()
    ) {
      throw new Error("Invalid or expired verification code. Please request a new code.");
    }

    // Mark OTP as consumed
    await prisma.emailOtp.update({
      where: { id: otpRecord.id },
      data: { isUsed: true },
    });
  } catch (err) {
    if ((err as Error).message.includes("Invalid or expired")) {
      throw err;
    }
    console.error("[PersonalAccess] DB error verifying OTP:", err);
    throw new Error("Verification failed due to a temporary system error. Please try again.");
  }

  // Set HTTP-only session cookie valid for 1 hour
  const expiresAt = Date.now() + PERSONAL_SESSION_DURATION_SEC * 1000;
  const sessionToken = signSessionToken(normalizedEmail, expiresAt);

  const cookieStore = await cookies();
  cookieStore.set(PERSONAL_SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: PERSONAL_SESSION_DURATION_SEC,
    path: "/",
  });

  await logAction({
    action: "PERSONAL_ACCESS_OTP_VERIFY",
    description: `Reporter ${normalizedEmail} successfully authenticated via OTP.`,
    actorOverride: { id: null, email: normalizedEmail, name: "Verified Reporter" },
  });

  return { success: true };
}

/**
 * Fetch all incidents submitted by the authenticated reporter.
 */
export async function getPersonalIncidentsAction() {
  const verifiedEmail = await getVerifiedPersonalEmail();
  if (!verifiedEmail) {
    throw new Error("Unauthorized. Please verify your email first.");
  }

  const incidents = await prisma.incidentReport.findMany({
    where: { contactEmail: verifiedEmail },
    orderBy: { submittedAt: "desc" },
    select: {
      id: true,
      ticketId: true,
      thehiveCaseId: true,
      title: true,
      type: true,
      status: true,
      hiveStatus: true,
      severity: true,
      submittedAt: true,
      updatedAt: true,
    },
  });

  return { verifiedEmail, incidents };
}

/**
 * Fetch detailed view for a specific incident (strictly scoped to verified email).
 */
export async function getPersonalIncidentDetailAction(id: string) {
  const verifiedEmail = await getVerifiedPersonalEmail();
  if (!verifiedEmail) {
    throw new Error("Unauthorized. Please verify your email first.");
  }

  const incident = await prisma.incidentReport.findFirst({
    where: {
      id,
      contactEmail: verifiedEmail,
    },
    select: {
      id: true,
      ticketId: true,
      thehiveCaseId: true,
      title: true,
      type: true,
      description: true,
      contactName: true,
      contactEmail: true,
      organization: true,
      severity: true,
      status: true,
      hiveStatus: true,
      submittedAt: true,
      updatedAt: true,
      caseCommunications: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          senderType: true,
          messageBody: true,
          attachments: true,
          createdAt: true,
        },
      },
    },
  });

  if (!incident) {
    throw new Error("Incident report not found.");
  }

  return incident;
}

/**
 * Sign out of personal access session.
 */
export async function personalSignOutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(PERSONAL_SESSION_COOKIE);
}
