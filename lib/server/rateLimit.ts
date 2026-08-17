import "server-only";
import { redis } from "@/lib/redis";

/**
 * Redis-backed rate limiting (fixed-window counter).
 * Replaces the Convex DB-based rate limiter.
 */

const RATE_LIMITS = {
  login: {
    maxAttempts: 5,
    windowSec: 15 * 60, // 15 minutes
    message: "Too many login attempts. Please try again later.",
  },
  incident_report: {
    maxAttempts: 5,
    windowSec: 60 * 60, // 1 hour
    message: "Too many incident reports. Please try again later.",
  },
  contact_form: {
    maxAttempts: 5,
    windowSec: 60 * 60, // 1 hour
    message: "Too many contact form submissions. Please try again later.",
  },
  incident_tracking: {
    maxAttempts: 10,
    windowSec: 15 * 60, // 15 minutes
    message: "Too many tracking lookups. Please try again later.",
  },
  file_upload: {
    maxAttempts: 10,
    windowSec: 60 * 60, // 1 hour
    message: "Too many file uploads. Please try again later.",
  },
  subscribe: {
    maxAttempts: 5,
    windowSec: 60 * 60, // 1 hour
    message: "Too many subscribe attempts. Please try again later.",
  },
  password_reset: {
    maxAttempts: 3,
    windowSec: 60 * 60, // 1 hour
    message: "Too many password reset requests. Please try again later.",
  },
  mda_respond: {
    maxAttempts: 10,
    windowSec: 15 * 60, // 15 minutes
    message: "Too many response submissions. Please try again later.",
  },
  api_evidence_download: {
    maxAttempts: 20,
    windowSec: 60, // 1 minute
    message: "Too many evidence download requests. Limit is 20 requests per minute.",
  },
  personal_otp: {
    maxAttempts: 3,
    windowSec: 15 * 60, // 15 minutes
    message: "Too many OTP requests. Please wait 15 minutes before requesting another code.",
  },
  personal_otp_verify: {
    maxAttempts: 5,
    windowSec: 15 * 60, // 15 minutes
    message: "Too many failed verification attempts. Please wait 15 minutes before trying again.",
  },
} as const;

export type RateLimitAction = keyof typeof RATE_LIMITS;

/**
 * Enforce a rate limit for the given identifier + action.
 * @throws Error if the limit has been exceeded.
 */
export async function checkRateLimit(
  identifier: string,
  action: RateLimitAction,
): Promise<void> {
  const config = RATE_LIMITS[action];
  const key = `ratelimit:${action}:${identifier}`;

  // Increment the counter. INCR returns the new value.
  const count = await redis.incr(key);

  // On the first hit, set the window expiry.
  if (count === 1) {
    await redis.expire(key, config.windowSec);
  }

  if (count > config.maxAttempts) {
    const ttl = await redis.ttl(key);
    const minutes = Math.max(1, Math.ceil(ttl / 60));
    throw new Error(
      `${config.message} (${minutes} minute${minutes === 1 ? "" : "s"} remaining)`,
    );
  }
}

/**
 * Clear a rate limit (e.g. after a successful login).
 */
export async function resetRateLimit(
  identifier: string,
  action: RateLimitAction,
): Promise<void> {
  await redis.del(`ratelimit:${action}:${identifier}`);
}
