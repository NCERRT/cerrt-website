import "server-only";

import { prisma } from "@/lib/prisma";

/**
 * Extracts domain and parent domain from an email address.
 * e.g. "officer@moj.zamfara.gov.ng" -> domain: "moj.zamfara.gov.ng", parentDomain: "zamfara.gov.ng"
 */
export function extractDomainAndParent(email: string): {
  domain: string;
  parentDomain: string | null;
} {
  const parts = email.trim().toLowerCase().split("@");
  if (parts.length !== 2 || !parts[1]) {
    return { domain: "", parentDomain: null };
  }

  const domain = parts[1];
  const domainParts = domain.split(".");

  // If sub-domain has 4+ parts (e.g. moj.zamfara.gov.ng -> zamfara.gov.ng)
  let parentDomain: string | null = null;
  if (domainParts.length >= 4) {
    parentDomain = domainParts.slice(1).join(".");
  }

  return { domain, parentDomain };
}

/**
 * Finds matching MdaOrganization ID for a given contact email.
 * Hierarchy:
 * 1. Exact domain match (e.g. "moj.zamfara.gov.ng")
 * 2. Parent domain match (e.g. "zamfara.gov.ng")
 */
export async function matchMdaOrganizationByEmail(email: string): Promise<string | null> {
  const { domain, parentDomain } = extractDomainAndParent(email);
  if (!domain) return null;

  // 1. Exact domain match
  const exactMatch = await prisma.mdaOrganization.findFirst({
    where: {
      isActive: true,
      verifiedDomains: { has: domain },
    },
    select: { id: true },
  });

  if (exactMatch) return exactMatch.id;

  // 2. Parent domain fallback
  if (parentDomain) {
    const parentMatch = await prisma.mdaOrganization.findFirst({
      where: {
        isActive: true,
        verifiedDomains: { has: parentDomain },
      },
      select: { id: true },
    });

    if (parentMatch) return parentMatch.id;
  }

  return null;
}
