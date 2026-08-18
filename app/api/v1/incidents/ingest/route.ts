import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { validateApiKey } from "@/lib/server/apiAuth";
import { checkRateLimit } from "@/lib/server/rateLimit";
import { logAction } from "@/lib/server/audit";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const ingestSchema = z.object({
  title: z.string().trim().optional(),
  description: z.string().trim().min(1, "Description is required"),
  contactEmail: z.string().trim().email("Invalid contact email address"),
  contactName: z.string().trim().min(1, "Contact name is required"),
  contactPhone: z.string().trim().optional().transform((val) => val || "N/A"),
  organization: z.string().trim().optional().transform((val) => val || "N/A"),
  type: z.string().trim().optional().transform((val) => val || "other"),
  severity: z
    .enum(["critical", "high", "medium", "low"])
    .catch("medium"),
  
  // Optional TheHive / Email metadata
  thehiveCaseId: z.string().trim().optional(),
  ticketId: z.string().trim().optional(),
  hiveStatus: z.string().trim().optional(),
  hiveSeverity: z.string().trim().optional(),
  hiveType: z.string().trim().optional(),
  hiveSummary: z.string().trim().optional(),
  emailMessageId: z.string().trim().optional(),
  submittedAt: z.string().optional(),
});

export async function POST(request: NextRequest) {
  // 1. Authenticate via Bearer API Key
  const auth = await validateApiKey(request);
  if (!auth.valid) {
    return NextResponse.json(
      { success: false, error: "Unauthorized. Valid Bearer API key required." },
      { status: 401 }
    );
  }

  // 2. Rate Limit (30 requests per minute per API key)
  try {
    await checkRateLimit(auth.apiKey.id, "api_ingest");
  } catch (err) {
    return NextResponse.json(
      { success: false, error: (err as Error).message || "Rate limit exceeded." },
      { status: 429 }
    );
  }

  // 3. Parse & Validate JSON Payload
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Malformed JSON payload in request body." },
      { status: 400 }
    );
  }

  const parseResult = ingestSchema.safeParse(rawBody);
  if (!parseResult.success) {
    const errorMsg = parseResult.error.issues[0]?.message || "Invalid payload format.";
    return NextResponse.json(
      { success: false, error: errorMsg, details: parseResult.error.issues },
      { status: 400 }
    );
  }

  const data = parseResult.data;
  const normalizedEmail = data.contactEmail.toLowerCase();

  try {
    // 4. Deduplication Check (by thehiveCaseId or emailMessageId)
    let existingIncident = null;

    if (data.thehiveCaseId) {
      existingIncident = await prisma.incidentReport.findFirst({
        where: { thehiveCaseId: data.thehiveCaseId },
      });
    }

    if (!existingIncident && data.emailMessageId) {
      existingIncident = await prisma.incidentReport.findUnique({
        where: { emailMessageId: data.emailMessageId },
      });
    }

    // 5A. Update Existing Incident (Idempotent Update)
    if (existingIncident) {
      const updatedIncident = await prisma.incidentReport.update({
        where: { id: existingIncident.id },
        data: {
          title: data.title || existingIncident.title,
          description: data.description || existingIncident.description,
          ticketId: data.ticketId || existingIncident.ticketId,
          thehiveCaseId: data.thehiveCaseId || existingIncident.thehiveCaseId,
          hiveStatus: data.hiveStatus || existingIncident.hiveStatus,
          hiveSeverity: data.hiveSeverity || existingIncident.hiveSeverity,
          hiveType: data.hiveType || existingIncident.hiveType,
          hiveSummary: data.hiveSummary || existingIncident.hiveSummary,
          emailMessageId: data.emailMessageId || existingIncident.emailMessageId,
        },
        select: {
          id: true,
          ticketId: true,
          thehiveCaseId: true,
          title: true,
          type: true,
          status: true,
          hiveStatus: true,
          submissionChannel: true,
          submittedAt: true,
          updatedAt: true,
        },
      });

      await logAction({
        action: "INCIDENT_INGEST_UPDATE",
        description: `Updated existing incident report (TheHive Case #${data.thehiveCaseId || existingIncident.thehiveCaseId}) via API key '${auth.apiKey.name}'.`,
        targetId: existingIncident.id,
        targetType: "IncidentReport",
        actorOverride: { id: null, email: "api@cerrt.gov.ng", name: `API Key (${auth.apiKey.name})` },
      });

      return NextResponse.json(
        {
          success: true,
          action: "updated",
          incident: updatedIncident,
        },
        { status: 200 }
      );
    }

    // 5B. Create New Incident Report
    let submittedAtDate = new Date();
    if (data.submittedAt) {
      const parsedDate = new Date(data.submittedAt);
      if (!Number.isNaN(parsedDate.getTime())) {
        submittedAtDate = parsedDate;
      }
    }

    const newIncident = await prisma.incidentReport.create({
      data: {
        title: data.title || "Email Incident Report",
        type: data.type,
        description: data.description,
        contactName: data.contactName,
        contactEmail: normalizedEmail,
        contactPhone: data.contactPhone,
        organization: data.organization,
        severity: data.severity,
        submissionChannel: "email",
        thehiveCaseId: data.thehiveCaseId || null,
        ticketId: data.ticketId || null,
        hiveStatus: data.hiveStatus || null,
        hiveSeverity: data.hiveSeverity || null,
        hiveType: data.hiveType || null,
        hiveSummary: data.hiveSummary || null,
        emailMessageId: data.emailMessageId || null,
        submittedAt: submittedAtDate,
      },
      select: {
        id: true,
        ticketId: true,
        thehiveCaseId: true,
        title: true,
        type: true,
        status: true,
        hiveStatus: true,
        submissionChannel: true,
        submittedAt: true,
      },
    });

    await logAction({
      action: "INCIDENT_INGEST_EMAIL",
      description: `Ingested email incident report for ${normalizedEmail} via API key '${auth.apiKey.name}'.`,
      targetId: newIncident.id,
      targetType: "IncidentReport",
      actorOverride: { id: null, email: normalizedEmail, name: data.contactName },
    });

    return NextResponse.json(
      {
        success: true,
        action: "created",
        incident: newIncident,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[API Ingest] Failed to ingest incident report:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error while processing incident report." },
      { status: 500 }
    );
  }
}
