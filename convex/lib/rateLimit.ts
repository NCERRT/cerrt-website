import type { MutationCtx } from "../_generated/server";

/**
 * Rate limit configurations
 */
const RATE_LIMITS = {
  login: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    message: "Too many login attempts. Please try again in 15 minutes.",
  },
  signup: {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
    message: "Too many signup attempts. Please try again in 1 hour.",
  },
  incident_report: {
    maxAttempts: 5,
    windowMs: 60 * 60 * 1000, // 1 hour
    message: "Too many incident reports. Please try again in 1 hour.",
  },
  file_upload: {
    maxAttempts: 10,
    windowMs: 60 * 60 * 1000, // 1 hour
    message: "Too many file uploads. Please try again in 1 hour.",
  },
  contact_form: {
    maxAttempts: 5,
    windowMs: 60 * 60 * 1000, // 1 hour
    message: "Too many contact form submissions. Please try again in 1 hour.",
  },
} as const;

type RateLimitAction = keyof typeof RATE_LIMITS;

/**
 * Check if an action is rate limited
 * @throws Error if rate limit exceeded
 */
export async function checkRateLimit(
  ctx: MutationCtx,
  identifier: string,
  action: RateLimitAction
): Promise<void> {
  const config = RATE_LIMITS[action];
  const now = Date.now();
  const windowStart = now - config.windowMs;

  // Find existing rate limit record
  const existing = await ctx.db
    .query("rateLimits")
    .withIndex("by_identifier_action", (q) =>
      q.eq("identifier", identifier).eq("action", action)
    )
    .first();

  if (existing) {
    // Check if we're still in the same window
    if (existing.windowStart > windowStart) {
      // Still in window - check attempt count
      if (existing.attemptCount >= config.maxAttempts) {
        const timeRemaining = Math.ceil(
          (existing.windowStart + config.windowMs - now) / 1000 / 60
        );
        throw new Error(
          `${config.message} (${timeRemaining} minutes remaining)`
        );
      }

      // Increment attempt count
      await ctx.db.patch(existing._id, {
        attemptCount: existing.attemptCount + 1,
        lastAttempt: now,
      });
    } else {
      // Window expired - reset
      await ctx.db.patch(existing._id, {
        attemptCount: 1,
        windowStart: now,
        lastAttempt: now,
      });
    }
  } else {
    // First attempt - create record
    await ctx.db.insert("rateLimits", {
      identifier,
      action,
      attemptCount: 1,
      windowStart: now,
      lastAttempt: now,
    });
  }
}

/**
 * Reset rate limit for a successful action (e.g., successful login)
 */
export async function resetRateLimit(
  ctx: MutationCtx,
  identifier: string,
  action: RateLimitAction
): Promise<void> {
  const existing = await ctx.db
    .query("rateLimits")
    .withIndex("by_identifier_action", (q) =>
      q.eq("identifier", identifier).eq("action", action)
    )
    .first();

  if (existing) {
    await ctx.db.delete(existing._id);
  }
}

/**
 * Clean up old rate limit records (can be called by cron)
 */
export async function cleanupOldRateLimits(ctx: MutationCtx): Promise<number> {
  const now = Date.now();
  const maxWindowMs = Math.max(
    ...Object.values(RATE_LIMITS).map((c) => c.windowMs)
  );
  const cutoff = now - maxWindowMs * 2; // Keep records for 2x the longest window

  const oldRecords = await ctx.db
    .query("rateLimits")
    .withIndex("by_windowStart")
    .filter((q) => q.lt(q.field("windowStart"), cutoff))
    .collect();

  for (const record of oldRecords) {
    await ctx.db.delete(record._id);
  }

  return oldRecords.length;
}
