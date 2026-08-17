"use server";

import crypto from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/server/rateLimit";
import { logAction } from "@/lib/server/audit";
import { sendOtpEmail } from "@/lib/server/email";
import { z } from "zod";

const PERSONAL_SESSION_COOKIE = "personalSessionId";
const PERSONAL_SESSION_DURATION_SEC = 60 * 60; // 1 hour
const OTP_EXPIRY_MINUTES = 10;

const emailSchema = z.string().trim().email("Please enter a valid email address.");

function getSecretKey(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret && process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET environment variable is missing in production.");
  }
  return secret || "cerrt-personal-access-secret-key-2026";
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
export async function requestOtpAction(
  email: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const parseResult = emailSchema.safeParse(email);
    if (!parseResult.success) {
      return { success: false, error: parseResult.error.issues[0]?.message || "Invalid email address" };
    }

    const normalizedEmail = parseResult.data.toLowerCase();

    // Enforce rate limit (3 attempts per 15 mins)
    await checkRateLimit(normalizedEmail, "personal_otp");

    // Check if there are any incidents submitted by this email
    const existingReport = await prisma.incidentReport.findFirst({
      where: {
        contactEmail: { equals: normalizedEmail, mode: "insensitive" },
      },
      select: { id: true },
    });

    if (!existingReport) {
      // Return success to avoid email enumeration, but do not generate OTP
      return {
        success: true,
        message: "If an incident report exists for this email, an OTP verification code has been sent.",
      };
    }

    // Generate cryptographically secure 6-digit numeric OTP code
    const rawOtpCode = crypto.randomInt(100000, 1000000).toString();
    const otpHash = crypto.createHash("sha256").update(rawOtpCode).digest("hex");
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

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

    // Send OTP email via SMTP
    try {
      await sendOtpEmail(normalizedEmail, rawOtpCode);
    } catch (emailErr) {
      console.error("[PersonalAccess] Failed to send OTP email:", emailErr);
      if (process.env.NODE_ENV === "production") {
        return { success: false, error: "Unable to send verification email. Please check server SMTP settings or try again later." };
      }
    }

    await logAction({
      action: "PERSONAL_ACCESS_OTP_REQUEST",
      description: `OTP verification code requested for email: ${normalizedEmail}`,
      actorOverride: { id: null, email: normalizedEmail, name: "Reporter User" },
    });

    return {
      success: true,
      message: "An OTP verification code has been sent to your email.",
    };
  } catch (err) {
    console.error("[PersonalAccess] Error requesting OTP:", err);
    return { success: false, error: (err as Error).message || "Unable to request verification code." };
  }
}

/**
 * Verify 6-digit OTP code and establish a 1-hour session.
 */
export async function verifyOtpAction(
  email: string,
  code: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const parseResult = emailSchema.safeParse(email);
    if (!parseResult.success) {
      return { success: false, error: "Invalid email address" };
    }
    const normalizedEmail = parseResult.data.toLowerCase();

    // Enforce rate limiting on verification attempts (5 attempts per 15 mins)
    await checkRateLimit(normalizedEmail, "personal_otp_verify");

    const trimmedCode = code.trim();
    if (!/^\d{6}$/.test(trimmedCode)) {
      await logAction({
        action: "PERSONAL_ACCESS_OTP_FAILURE",
        description: `Failed OTP verification attempt (malformed code) for ${normalizedEmail}.`,
        actorOverride: { id: null, email: normalizedEmail, name: "Anonymous Reporter" },
      });
      return { success: false, error: "Please enter a valid 6-digit verification code." };
    }

    const otpHash = crypto.createHash("sha256").update(trimmedCode).digest("hex");

    const otpRecord = await prisma.emailOtp.findFirst({
      where: {
        email: normalizedEmail,
        otpHash,
        isUsed: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!otpRecord) {
      await logAction({
        action: "PERSONAL_ACCESS_OTP_FAILURE",
        description: `Failed OTP verification attempt (invalid/expired code) for ${normalizedEmail}.`,
        actorOverride: { id: null, email: normalizedEmail, name: "Anonymous Reporter" },
      });
      return { success: false, error: "Invalid or expired verification code. Please request a new code." };
    }

    // Mark OTP as consumed
    await prisma.emailOtp.update({
      where: { id: otpRecord.id },
      data: { isUsed: true },
    });

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
  } catch (err) {
    console.error("[PersonalAccess] Error verifying OTP:", err);
    return { success: false, error: (err as Error).message || "Verification failed." };
  }
}

export interface PersonalIncidentSummary {
  id: string;
  ticketId: string | null;
  thehiveCaseId: string | null;
  title: string | null;
  type: string;
  status: "new" | "reviewing" | "resolved" | "closed";
  hiveStatus: string | null;
  severity: "critical" | "high" | "medium" | "low";
  submittedAt: Date;
  updatedAt: Date | null;
}

export interface PersonalCaseCommunication {
  id: string;
  senderType: "analyst" | "mda_poc";
  messageBody: string;
  attachments: Array<{ key: string; name: string }> | null;
  createdAt: Date;
}

export interface PersonalIncidentDetail {
  id: string;
  ticketId: string | null;
  thehiveCaseId: string | null;
  title: string | null;
  type: string;
  description: string;
  contactName: string;
  contactEmail: string;
  organization: string;
  severity: "critical" | "high" | "medium" | "low";
  status: "new" | "reviewing" | "resolved" | "closed";
  hiveStatus: string | null;
  submittedAt: Date;
  updatedAt: Date | null;
  caseCommunications: PersonalCaseCommunication[];
}

/**
 * Fetch all incidents submitted by the authenticated reporter.
 */
export async function getPersonalIncidentsAction(): Promise<{
  success: boolean;
  verifiedEmail?: string;
  incidents?: PersonalIncidentSummary[];
  error?: string;
}> {
  try {
    const verifiedEmail = await getVerifiedPersonalEmail();
    if (!verifiedEmail) {
      return { success: false, error: "Unauthorized. Please verify your email first." };
    }

    const incidents = await prisma.incidentReport.findMany({
      where: {
        contactEmail: { equals: verifiedEmail, mode: "insensitive" },
      },
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

    return { success: true, verifiedEmail, incidents: incidents as PersonalIncidentSummary[] };
  } catch (err) {
    console.error("[PersonalAccess] Error fetching personal incidents:", err);
    return { success: false, error: (err as Error).message || "Failed to load incidents." };
  }
}

/**
 * Fetch detailed view for a specific incident (strictly scoped to verified email).
 */
export async function getPersonalIncidentDetailAction(id: string): Promise<{
  success: boolean;
  incident?: PersonalIncidentDetail;
  error?: string;
}> {
  try {
    const verifiedEmail = await getVerifiedPersonalEmail();
    if (!verifiedEmail) {
      return { success: false, error: "Unauthorized. Please verify your email first." };
    }

    const incident = await prisma.incidentReport.findFirst({
      where: {
        id,
        contactEmail: { equals: verifiedEmail, mode: "insensitive" },
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
      return { success: false, error: "Incident report not found." };
    }

    return { success: true, incident: incident as PersonalIncidentDetail };
  } catch (err) {
    console.error("[PersonalAccess] Error fetching incident detail:", err);
    return { success: false, error: (err as Error).message || "Failed to load incident detail." };
  }
}

/**
 * Sign out of personal access session.
 */
export async function personalSignOutAction(): Promise<{ success: boolean }> {
  try {
    const verifiedEmail = await getVerifiedPersonalEmail();
    if (verifiedEmail) {
      await logAction({
        action: "PERSONAL_ACCESS_LOGOUT",
        description: `Reporter ${verifiedEmail} signed out of personal access session.`,
        actorOverride: { id: null, email: verifiedEmail, name: "Verified Reporter" },
      });
    }
    const cookieStore = await cookies();
    cookieStore.delete(PERSONAL_SESSION_COOKIE);
    return { success: true };
  } catch (err) {
    console.error("[PersonalAccess] Error signing out:", err);
    return { success: true }; // Cookie clear attempted
  }
}
