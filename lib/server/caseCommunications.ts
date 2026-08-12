import "server-only";
import { prisma } from "@/lib/prisma";
import type { SenderType } from "@prisma/client";

export interface CreateCaseCommunicationInput {
  cerrtCaseId: string;
  thehiveCaseId?: string;
  senderType: SenderType;
  messageBody: string;
  attachmentKey?: string;
  attachmentName?: string;
  attachments?: { key: string; name: string }[];
}

export function getCaseCommunications(cerrtCaseId: string) {
  return prisma.caseCommunication.findMany({
    where: { cerrtCaseId },
    orderBy: { createdAt: "asc" },
  });
}

export function createCaseCommunication(data: CreateCaseCommunicationInput) {
  return prisma.caseCommunication.create({
    data,
  });
}
