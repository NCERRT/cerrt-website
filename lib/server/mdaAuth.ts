import "server-only";

import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";
import { logAction } from "@/lib/server/audit";
import { checkRateLimit, resetRateLimit } from "@/lib/server/rateLimit";

export const MDA_SESSION_COOKIE = "mdaSessionId";
const MDA_SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

export interface AuthenticatedMdaUser {
  accountId: string;
  email: string;
  contactName: string;
  jobTitle: string | null;
  phone: string | null;
  mustChangePassword: boolean;
  organizationId: string;
  organizationName: string;
  acronym: string | null;
  sector: string | null;
  verifiedDomains: string[];
}

/**
 * Validates current MDA session cookie against DB.
 */
export async function getMdaSession(): Promise<AuthenticatedMdaUser | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(MDA_SESSION_COOKIE)?.value;

  if (!sessionId) return null;

  const session = await prisma.mdaSession.findUnique({
    where: { id: sessionId },
    include: {
      mdaAccount: {
        include: {
          mdaOrganization: true,
        },
      },
    },
  });

  if (!session) return null;

  // Check expiry
  if (session.expiresAt.getTime() < Date.now()) {
    await prisma.mdaSession.delete({ where: { id: sessionId } }).catch(() => {});
    return null;
  }

  const account = session.mdaAccount;
  const organization = account.mdaOrganization;

  if (!account.isActive || !organization.isActive) {
    return null;
  }

  return {
    accountId: account.id,
    email: account.email,
    contactName: account.contactName,
    jobTitle: account.jobTitle,
    phone: account.phone,
    mustChangePassword: account.mustChangePassword,
    organizationId: organization.id,
    organizationName: organization.name,
    acronym: organization.acronym,
    sector: organization.sector,
    verifiedDomains: organization.verifiedDomains,
  };
}

/**
 * Requires an active MDA session or throws error.
 */
export async function requireMdaSession(): Promise<AuthenticatedMdaUser> {
  const session = await getMdaSession();
  if (!session) {
    throw new Error("Unauthorized. Please log in to your MDA account.");
  }
  return session;
}

/**
 * Creates a fresh DB session and sets HTTP-only cookie.
 */
async function createMdaSession(mdaAccountId: string): Promise<string> {
  // Clear old sessions for this account
  await prisma.mdaSession.deleteMany({ where: { mdaAccountId } });

  const session = await prisma.mdaSession.create({
    data: {
      mdaAccountId,
      expiresAt: new Date(Date.now() + MDA_SESSION_DURATION_MS),
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(MDA_SESSION_COOKIE, session.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 24 * 60 * 60, // 24 hours
    path: "/",
  });

  return session.id;
}

/**
 * Log in MDA account with email + password.
 */
export async function mdaLogin(email: string, password: string): Promise<AuthenticatedMdaUser> {
  const normalizedEmail = email.trim().toLowerCase();

  // Enforce Rate Limiting (5 attempts / 15 mins)
  await checkRateLimit(normalizedEmail, "mda_login");

  const account = await prisma.mdaAccount.findUnique({
    where: { email: normalizedEmail },
    include: { mdaOrganization: true },
  });

  if (!account) {
    await logAction({
      action: "MDA_LOGIN_FAILURE",
      description: `Failed MDA login attempt for non-existent email: ${normalizedEmail}`,
    });
    throw new Error("Invalid email or password.");
  }

  if (!account.isActive || !account.mdaOrganization.isActive) {
    await logAction({
      action: "MDA_LOGIN_FAILURE",
      description: `Login blocked for deactivated MDA account/organization: ${normalizedEmail}`,
    });
    throw new Error("Your MDA account has been deactivated. Please contact CERRT administration.");
  }

  const isValidPassword = await bcrypt.compare(password, account.passwordHash);
  if (!isValidPassword) {
    await logAction({
      action: "MDA_LOGIN_FAILURE",
      description: `Invalid password for MDA login: ${normalizedEmail}`,
    });
    throw new Error("Invalid email or password.");
  }

  // Clear rate limit on success
  await resetRateLimit(normalizedEmail, "mda_login");

  // Create session
  await createMdaSession(account.id);

  await logAction({
    action: "MDA_LOGIN_SUCCESS",
    description: `MDA user ${account.contactName} (${normalizedEmail}) logged in for ${account.mdaOrganization.name}`,
    targetId: account.id,
    targetType: "MdaAccount",
  });

  return {
    accountId: account.id,
    email: account.email,
    contactName: account.contactName,
    jobTitle: account.jobTitle,
    phone: account.phone,
    mustChangePassword: account.mustChangePassword,
    organizationId: account.mdaOrganization.id,
    organizationName: account.mdaOrganization.name,
    acronym: account.mdaOrganization.acronym,
    sector: account.mdaOrganization.sector,
    verifiedDomains: account.mdaOrganization.verifiedDomains,
  };
}

/**
 * Log out current MDA session.
 */
export async function mdaLogout(): Promise<void> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(MDA_SESSION_COOKIE)?.value;

  if (sessionId) {
    const session = await prisma.mdaSession.findUnique({
      where: { id: sessionId },
      include: { mdaAccount: true },
    });

    if (session) {
      await logAction({
        action: "MDA_LOGOUT",
        description: `MDA user ${session.mdaAccount.email} logged out`,
        targetId: session.mdaAccountId,
        targetType: "MdaAccount",
      });
      await prisma.mdaSession.delete({ where: { id: sessionId } }).catch(() => {});
    }
  }

  cookieStore.delete(MDA_SESSION_COOKIE);
}

/**
 * Updates MDA contact officer profile info.
 */
export async function updateMdaProfile(input: {
  contactName: string;
  jobTitle: string;
  phone?: string;
}) {
  const session = await requireMdaSession();

  await prisma.mdaAccount.update({
    where: { id: session.accountId },
    data: {
      contactName: input.contactName.trim(),
      jobTitle: input.jobTitle.trim(),
      phone: input.phone?.trim() || null,
    },
  });

  await logAction({
    action: "MDA_PROFILE_UPDATE",
    description: `MDA user ${session.email} updated profile details`,
    actorOverride: {
      id: session.accountId,
      email: session.email,
      name: session.contactName,
    },
    targetId: session.accountId,
    targetType: "MdaAccount",
  });
}

/**
 * Changes MDA account password.
 */
export async function changeMdaPassword(currentPassword: string, newPassword: string) {
  const session = await requireMdaSession();

  const account = await prisma.mdaAccount.findUnique({
    where: { id: session.accountId },
  });

  if (!account) throw new Error("Account not found.");

  const isValidPassword = await bcrypt.compare(currentPassword, account.passwordHash);
  if (!isValidPassword) {
    throw new Error("Current password is incorrect.");
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);

  await prisma.mdaAccount.update({
    where: { id: session.accountId },
    data: {
      passwordHash,
      mustChangePassword: false,
    },
  });

  await logAction({
    action: "MDA_PASSWORD_CHANGE",
    description: `MDA user ${session.email} updated account password`,
    actorOverride: {
      id: session.accountId,
      email: session.email,
      name: session.contactName,
    },
    targetId: session.accountId,
    targetType: "MdaAccount",
  });
}
