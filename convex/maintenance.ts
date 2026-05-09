import { internalMutation } from "./_generated/server";
import { cleanupOldRateLimits } from "./lib/rateLimit";

/**
 * Cleanup old rate limit records
 * Runs daily via cron job
 */
export const cleanupRateLimits = internalMutation({
  handler: async (ctx) => {
    const deletedCount = await cleanupOldRateLimits(ctx);
    console.log(`Cleaned up ${deletedCount} old rate limit records`);
    return deletedCount;
  },
});

/**
 * Cleanup expired sessions
 * Runs daily via cron job
 */
export const cleanupExpiredSessions = internalMutation({
  handler: async (ctx) => {
    const now = Date.now();
    const sessions = await ctx.db.query("sessions").collect();

    let deletedCount = 0;
    for (const session of sessions) {
      if (session.expiresAt < now) {
        await ctx.db.delete(session._id);
        deletedCount++;
      }
    }

    console.log(`Cleaned up ${deletedCount} expired sessions`);
    return deletedCount;
  },
});
