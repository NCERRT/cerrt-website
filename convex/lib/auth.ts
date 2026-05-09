import type { QueryCtx, MutationCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

/**
 * Validates a session and returns the authenticated user ID
 * @throws Error if session is invalid or expired
 */
export async function requireAuth(
  ctx: QueryCtx | MutationCtx,
  sessionId: Id<"sessions"> | undefined
): Promise<Id<"users">> {
  if (!sessionId) {
    throw new Error("Authentication required. Please log in.");
  }

  const session = await ctx.db.get(sessionId);

  if (!session) {
    throw new Error("Invalid session. Please log in again.");
  }

  // Check if session is expired
  if (session.expiresAt < Date.now()) {
    throw new Error("Session expired. Please log in again.");
  }

  // Verify user still exists
  const user = await ctx.db.get(session.userId);
  if (!user) {
    throw new Error("User not found. Please contact support.");
  }

  return session.userId;
}

/**
 * Optional: Gets authenticated user ID if session is valid, returns null otherwise
 */
export async function getAuthOrNull(
  ctx: QueryCtx | MutationCtx,
  sessionId: Id<"sessions"> | undefined
): Promise<Id<"users"> | null> {
  try {
    return await requireAuth(ctx, sessionId);
  } catch {
    return null;
  }
}
