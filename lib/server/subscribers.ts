import "server-only";
import { prisma } from "@/lib/prisma";

/**
 * Data-access layer for newsletter subscribers.
 */

export interface ListSubscribersParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

export async function listSubscribers(params: ListSubscribersParams = {}) {
  const page = params.page || 1;
  const pageSize = params.pageSize || 15;
  const skip = (page - 1) * pageSize;

  const where: Record<string, unknown> = {};

  if (params.search && params.search.trim()) {
    where.email = { contains: params.search.trim(), mode: "insensitive" };
  }

  const [subscribers, totalCount] = await Promise.all([
    prisma.subscriber.findMany({
      where,
      orderBy: { subscribedAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.subscriber.count({ where }),
  ]);

  return { subscribers, totalCount };
}

export function findSubscriberByEmail(email: string) {
  return prisma.subscriber.findUnique({ where: { email } });
}

export function createSubscriber(email: string) {
  return prisma.subscriber.create({ data: { email } });
}

export function deleteSubscriber(id: string) {
  return prisma.subscriber.delete({ where: { id } });
}

export function countSubscribers() {
  return prisma.subscriber.count();
}
