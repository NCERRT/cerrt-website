import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Clean up old rate limit records daily at 3 AM
crons.daily(
  "cleanup rate limits",
  { hourUTC: 3, minuteUTC: 0 },
  internal.maintenance.cleanupRateLimits
);

// Clean up expired sessions daily at 4 AM
crons.daily(
  "cleanup expired sessions",
  { hourUTC: 4, minuteUTC: 0 },
  internal.maintenance.cleanupExpiredSessions
);

export default crons;
