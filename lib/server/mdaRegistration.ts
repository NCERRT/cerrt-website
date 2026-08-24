import "server-only";

import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { logAction } from "@/lib/server/audit";
import { sendMdaApprovalEmail, sendMdaRejectionEmail } from "@/lib/server/email";

const COOLDOWN_HOURS = 72; // 72-hour rejection cooldown

export interface MdaRegistrationInput {
  organizationName: string;
  acronym?: string;
  sector?: string;
  contactName: string;
  contactEmail: string;
  jobTitle: string;
  phone?: string;
  password: string;
}

/**
 * Validates public domain restrictions.
 */
export function validateMdaEmailDomain(email: string): {
  isValid: boolean;
  domain: string;
  isOfficialTld: boolean;
  error?: string;
} {
  const normalized = email.trim().toLowerCase();
  const domain = normalized.split("@")[1];

  if (!domain) {
    return { isValid: false, domain: "", isOfficialTld: false, error: "Invalid email address format." };
  }

  const blockedPublicDomains = [
    "gmail.com",
    "yahoo.com",
    "hotmail.com",
    "outlook.com",
    "icloud.com",
    "protonmail.com",
    "yandex.com",
    "mail.com",
    "zoho.com",
    "gmx.com",
    "aol.com",
  ];

  if (blockedPublicDomains.includes(domain)) {
    return {
      isValid: false,
      domain,
      isOfficialTld: false,
      error: `Public email providers (@${domain}) are not permitted. Please use your official government email address (.gov.ng, .mil.ng).`,
    };
  }

  const isOfficialTld =
    domain.endsWith(".gov.ng") || domain.endsWith(".mil.ng") || domain.endsWith(".edu.ng");

  return { isValid: true, domain, isOfficialTld };
}

/**
 * Submits a new MDA self-registration application.
 */
export async function submitMdaRegistration(input: MdaRegistrationInput) {
  const normalizedEmail = input.contactEmail.trim().toLowerCase();

  const emailValidation = validateMdaEmailDomain(normalizedEmail);
  if (!emailValidation.isValid) {
    throw new Error(emailValidation.error || "Invalid registration email domain.");
  }

  const existingApp = await prisma.mdaRegistration.findFirst({
    where: { contactEmail: normalizedEmail },
    orderBy: { createdAt: "desc" },
  });

  if (existingApp) {
    if (existingApp.status === "pending") {
      throw new Error(
        "A registration application for this email address is already pending CERRT Admin review.",
      );
    }
    if (existingApp.status === "approved") {
      throw new Error(
        "An MDA Portal account for this email address has already been approved. Please use the login page.",
      );
    }
    if (existingApp.status === "rejected" && existingApp.reviewedAt) {
      const cooldownMs = COOLDOWN_HOURS * 60 * 60 * 1000;
      const elapsedMs = Date.now() - existingApp.reviewedAt.getTime();
      if (elapsedMs < cooldownMs) {
        const remainingHours = Math.ceil((cooldownMs - elapsedMs) / (60 * 60 * 1000));
        throw new Error(
          `Your previous registration was rejected. Please wait ${remainingHours} hours before submitting a new application.`,
        );
      }
    }
  }

  const passwordHash = await bcrypt.hash(input.password, 12);

  let registration;
  if (existingApp && existingApp.status === "rejected") {
    registration = await prisma.mdaRegistration.update({
      where: { id: existingApp.id },
      data: {
        organizationName: input.organizationName.trim(),
        acronym: input.acronym?.trim() || null,
        sector: input.sector?.trim() || null,
        contactName: input.contactName.trim(),
        jobTitle: input.jobTitle.trim(),
        phone: input.phone?.trim() || null,
        passwordHash,
        emailDomain: emailValidation.domain,
        status: "pending",
        reviewNote: null,
        reviewedById: null,
        reviewedAt: null,
      },
    });
  } else {
    registration = await prisma.mdaRegistration.create({
      data: {
        organizationName: input.organizationName.trim(),
        acronym: input.acronym?.trim() || null,
        sector: input.sector?.trim() || null,
        contactName: input.contactName.trim(),
        contactEmail: normalizedEmail,
        jobTitle: input.jobTitle.trim(),
        phone: input.phone?.trim() || null,
        passwordHash,
        emailDomain: emailValidation.domain,
        status: "pending",
      },
    });
  }

  await logAction({
    action: "MDA_REGISTRATION_SUBMITTED",
    description: `MDA registration application submitted for ${input.organizationName} (${normalizedEmail})`,
    targetId: registration.id,
    targetType: "MdaRegistration",
    metadata: {
      organizationName: input.organizationName,
      contactEmail: normalizedEmail,
      domain: emailValidation.domain,
    },
  });

  return registration;
}

export interface GetMdaRegistrationsParams {
  page?: number;
  pageSize?: number;
  search?: string;
  statusFilter?: "pending" | "approved" | "rejected" | "ALL";
}

export async function getMdaRegistrations(params: GetMdaRegistrationsParams = {}) {
  const page = params.page || 1;
  const pageSize = params.pageSize || 15;
  const skip = (page - 1) * pageSize;

  const where: Record<string, unknown> = {};

  if (params.statusFilter && params.statusFilter !== "ALL") {
    where.status = params.statusFilter;
  }

  if (params.search && params.search.trim()) {
    const q = params.search.trim();
    where.OR = [
      { organizationName: { contains: q, mode: "insensitive" } },
      { contactName: { contains: q, mode: "insensitive" } },
      { contactEmail: { contains: q, mode: "insensitive" } },
      { emailDomain: { contains: q, mode: "insensitive" } },
      { acronym: { contains: q, mode: "insensitive" } },
    ];
  }

  const [registrations, totalCount] = await Promise.all([
    prisma.mdaRegistration.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.mdaRegistration.count({ where }),
  ]);

  return { registrations, totalCount };
}

export async function getMdaRegistrationById(id: string) {
  return prisma.mdaRegistration.findUnique({
    where: { id },
  });
}

export async function approveMdaRegistration(
  registrationId: string,
  reviewerUserId: string,
  reviewerEmail?: string,
  reviewerName?: string,
) {
  const registration = await prisma.mdaRegistration.findUnique({
    where: { id: registrationId },
  });

  if (!registration) {
    throw new Error("Registration application not found.");
  }

  if (registration.status !== "pending") {
    throw new Error(`Registration is already ${registration.status}.`);
  }

  const existingAccount = await prisma.mdaAccount.findUnique({
    where: { email: registration.contactEmail },
  });
  if (existingAccount) {
    throw new Error("An MDA account with this contact email already exists.");
  }

  const result = await prisma.$transaction(async (tx) => {
    const updatedReg = await tx.mdaRegistration.update({
      where: { id: registrationId },
      data: {
        status: "approved",
        reviewedById: reviewerUserId,
        reviewedAt: new Date(),
      },
    });

    const organization = await tx.mdaOrganization.create({
      data: {
        name: registration.organizationName,
        acronym: registration.acronym,
        sector: registration.sector,
        verifiedDomains: [registration.emailDomain],
        isActive: true,
      },
    });

    const account = await tx.mdaAccount.create({
      data: {
        mdaOrganizationId: organization.id,
        email: registration.contactEmail,
        passwordHash: registration.passwordHash,
        contactName: registration.contactName,
        jobTitle: registration.jobTitle,
        phone: registration.phone,
        isActive: true,
      },
    });

    return { registration: updatedReg, organization, account };
  });

  try {
    await sendMdaApprovalEmail(
      registration.contactEmail,
      registration.contactName,
      registration.organizationName,
    );
  } catch (emailError) {
    console.error("Failed to send MDA approval email:", emailError);
  }

  await logAction({
    action: "MDA_REGISTRATION_APPROVED",
    description: `MDA registration for ${registration.organizationName} (${registration.contactEmail}) was approved by ${reviewerName || reviewerEmail || "Admin"}. Organization & 1:1 account created.`,
    actorOverride: {
      id: reviewerUserId,
      email: reviewerEmail || "",
      name: reviewerName || "",
    },
    targetId: registration.id,
    targetType: "MdaRegistration",
    metadata: {
      registrationId,
      organizationId: result.organization.id,
      accountId: result.account.id,
    },
  });

  return result;
}

export async function rejectMdaRegistration(
  registrationId: string,
  reviewNote: string,
  reviewerUserId: string,
  reviewerEmail?: string,
  reviewerName?: string,
) {
  const registration = await prisma.mdaRegistration.findUnique({
    where: { id: registrationId },
  });

  if (!registration) {
    throw new Error("Registration application not found.");
  }

  if (registration.status !== "pending") {
    throw new Error(`Registration is already ${registration.status}.`);
  }

  const updatedReg = await prisma.mdaRegistration.update({
    where: { id: registrationId },
    data: {
      status: "rejected",
      reviewNote: reviewNote.trim(),
      reviewedById: reviewerUserId,
      reviewedAt: new Date(),
    },
  });

  try {
    await sendMdaRejectionEmail(
      registration.contactEmail,
      registration.contactName,
      registration.organizationName,
      reviewNote,
    );
  } catch (emailError) {
    console.error("Failed to send MDA rejection email:", emailError);
  }

  await logAction({
    action: "MDA_REGISTRATION_REJECTED",
    description: `MDA registration for ${registration.organizationName} (${registration.contactEmail}) was rejected by ${reviewerName || reviewerEmail || "Admin"}. Reason: ${reviewNote}`,
    actorOverride: {
      id: reviewerUserId,
      email: reviewerEmail || "",
      name: reviewerName || "",
    },
    targetId: registration.id,
    targetType: "MdaRegistration",
    metadata: {
      registrationId,
      reason: reviewNote,
    },
  });

  return updatedReg;
}

/**
 * Retrieves all registered MDA Organizations for Superadmin management.
 */
export interface GetMdaOrganizationsParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

export async function getMdaOrganizations(params: GetMdaOrganizationsParams = {}) {
  const page = params.page || 1;
  const pageSize = params.pageSize || 15;
  const skip = (page - 1) * pageSize;

  const where: Record<string, unknown> = {};

  if (params.search && params.search.trim()) {
    const q = params.search.trim();
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { acronym: { contains: q, mode: "insensitive" } },
      { sector: { contains: q, mode: "insensitive" } },
      { verifiedDomains: { has: q.toLowerCase() } },
      { account: { is: { contactName: { contains: q, mode: "insensitive" } } } },
      { account: { is: { email: { contains: q, mode: "insensitive" } } } },
    ];
  }

  const [organizations, totalCount] = await Promise.all([
    prisma.mdaOrganization.findMany({
      where,
      include: {
        account: {
          select: {
            id: true,
            email: true,
            contactName: true,
            jobTitle: true,
            phone: true,
            isActive: true,
          },
        },
        incidentReports: {
          select: { id: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.mdaOrganization.count({ where }),
  ]);

  return { organizations, totalCount };
}

/**
 * Toggles an MDA Organization active status.
 */
export async function toggleMdaOrganizationActive(
  organizationId: string,
  reviewerUserId: string,
  reviewerEmail?: string,
  reviewerName?: string,
) {
  const org = await prisma.mdaOrganization.findUnique({
    where: { id: organizationId },
  });

  if (!org) throw new Error("MDA Organization not found.");

  const newStatus = !org.isActive;

  const updated = await prisma.mdaOrganization.update({
    where: { id: organizationId },
    data: { isActive: newStatus },
  });

  await logAction({
    action: newStatus ? "MDA_ORG_ACTIVATED" : "MDA_ORG_DEACTIVATED",
    description: `MDA Organization ${org.name} was ${newStatus ? "activated" : "deactivated"} by ${reviewerName || reviewerEmail || "Admin"}.`,
    actorOverride: {
      id: reviewerUserId,
      email: reviewerEmail || "",
      name: reviewerName || "",
    },
    targetId: organizationId,
    targetType: "MdaOrganization",
  });

  return updated;
}
