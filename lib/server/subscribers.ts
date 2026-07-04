import "server-only";
import { prisma } from "@/lib/prisma";

/**
 * Data-access layer for newsletter subscribers.
 */

export function listSubscribers() {
  return prisma.subscriber.findMany({
    orderBy: { subscribedAt: "desc" },
  });
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
