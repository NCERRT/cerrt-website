"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/server/auth";
import { checkRateLimit } from "@/lib/server/rateLimit";
import {
  listSubscribers,
  createSubscriber,
  findSubscriberByEmail,
  deleteSubscriber,
} from "@/lib/server/subscribers";
import { subscribeSchema, formatZodError } from "@/lib/schemas";
import { logAction } from "@/lib/server/audit";

/**
 * Public: subscribe an email to advisory notifications.
 * Idempotent — subscribing the same email again returns
 * `{ alreadySubscribed: true }` rather than an error.
 */
export async function subscribeAction(
  email: string,
): Promise<{ alreadySubscribed: boolean }> {
  const parsed = subscribeSchema.safeParse({ email });
  if (!parsed.success) {
    throw new Error(formatZodError(parsed.error));
  }

  const normalized = parsed.data.email;

  await checkRateLimit(normalized, "subscribe");

  const existing = await findSubscriberByEmail(normalized);
  if (existing) {
    return { alreadySubscribed: true };
  }

  await createSubscriber(normalized);
  revalidatePath("/cerrt-ops/subscribers");
  return { alreadySubscribed: false };
}

/**
 * Admin only: list all subscribers.
 */
export async function getSubscribersAction() {
  await requireAuth();
  return listSubscribers();
}

/**
 * Admin only: remove a subscriber.
 */
export async function deleteSubscriberAction(id: string): Promise<void> {
  await requireAuth();
  await deleteSubscriber(id);
  revalidatePath("/cerrt-ops/subscribers");
}

/**
 * Admin only: return the full subscriber list as a CSV string.
 * The client turns this into a Blob download.
 */
export async function exportSubscribersCsvAction(): Promise<string> {
  const me = await requireAuth();
  const subs = await listSubscribers();

  await logAction({
    action: "SUBSCRIBERS_EXPORT",
    description: `Administrator ${me.name} (${me.email}) exported the subscriber list to CSV.`,
  });

  const escape = (v: string) => {
    // Prevent CSV formula injection: prefix values starting with =, +, -, @, tab, CR
    const needsPrefix = /^[=+\-@\t\r]/.test(v);
    const safe = needsPrefix ? `'${v}` : v;
    // Quote if contains comma, quote, or newline
    if (/[",\n\r]/.test(safe)) {
      return `"${safe.replace(/"/g, '""')}"`;
    }
    return safe;
  };

  const lines = ["email,subscribedAt"];
  for (const s of subs) {
    lines.push(`${escape(s.email)},${s.subscribedAt.toISOString()}`);
  }
  return lines.join("\n");
}
