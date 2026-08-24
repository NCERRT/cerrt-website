"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { formatZodError } from "@/lib/schemas";
import {
  getMdaDashboardStats,
  getMdaIncidentById,
  getMdaIncidents,
  postMdaCaseCommunication,
  submitMdaIncidentReport,
} from "@/lib/server/mdaIncidents";

const reportSchema = z.object({
  title: z.string().trim().max(200).optional(),
  type: z.string().trim().min(1, "Incident type is required."),
  description: z.string().trim().min(10, "Description must be at least 10 characters.").max(5000),
  severity: z.enum(["low", "medium", "high", "critical"]),
  contactName: z.string().trim().optional(),
  contactEmail: z.string().trim().optional(),
  contactPhone: z.string().trim().optional(),
});

const communicationSchema = z.object({
  incidentId: z.string().min(1, "Incident ID is required."),
  messageBody: z.string().trim().min(2, "Message body is required.").max(4000),
  attachmentKey: z.string().optional(),
  attachmentName: z.string().optional(),
});

export type ActionResult<T = void> =
  | { success: true; message?: string; data?: T }
  | { success: false; error: string };

/**
 * Retrieves stats and recent incidents for MDA dashboard.
 */
export async function getMdaDashboardStatsAction(): Promise<
  ActionResult<Awaited<ReturnType<typeof getMdaDashboardStats>>>
> {
  try {
    const data = await getMdaDashboardStats();
    return { success: true, data };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load MDA dashboard statistics.";
    return { success: false, error: message };
  }
}

/**
 * Retrieves all incidents linked to the authenticated MDA organization.
 */
export async function getMdaIncidentsAction(): Promise<
  ActionResult<Awaited<ReturnType<typeof getMdaIncidents>>>
> {
  try {
    const data = await getMdaIncidents();
    return { success: true, data };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load MDA incidents.";
    return { success: false, error: message };
  }
}

/**
 * Retrieves details for a single MDA incident report.
 */
export async function getMdaIncidentByIdAction(
  id: string,
): Promise<ActionResult<Awaited<ReturnType<typeof getMdaIncidentById>>>> {
  try {
    const data = await getMdaIncidentById(id);
    if (!data) {
      return { success: false, error: "Incident report not found." };
    }
    return { success: true, data };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load incident details.";
    return { success: false, error: message };
  }
}

/**
 * Submits a new incident report from the MDA Portal.
 */
export async function submitMdaIncidentReportAction(
  rawInput: z.infer<typeof reportSchema>,
): Promise<ActionResult<{ id: string }>> {
  try {
    const parseResult = reportSchema.safeParse(rawInput);
    if (!parseResult.success) {
      return { success: false, error: formatZodError(parseResult.error) };
    }

    const report = await submitMdaIncidentReport(parseResult.data);

    revalidatePath("/mda-portal");
    revalidatePath("/mda-portal/cases");
    revalidatePath("/cerrt-ops/reports");

    return {
      success: true,
      message: "Incident report submitted successfully.",
      data: { id: report.id },
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to submit incident report.";
    return { success: false, error: message };
  }
}

/**
 * Posts a message from an MDA Officer to a case communication thread.
 */
export async function postMdaCaseCommunicationAction(
  rawInput: z.infer<typeof communicationSchema>,
): Promise<ActionResult> {
  try {
    const parseResult = communicationSchema.safeParse(rawInput);
    if (!parseResult.success) {
      return { success: false, error: formatZodError(parseResult.error) };
    }

    await postMdaCaseCommunication(
      parseResult.data.incidentId,
      parseResult.data.messageBody,
      parseResult.data.attachmentKey,
      parseResult.data.attachmentName,
    );

    revalidatePath(`/mda-portal/cases/${parseResult.data.incidentId}`);

    return {
      success: true,
      message: "Response sent successfully.",
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to send response.";
    return { success: false, error: message };
  }
}
