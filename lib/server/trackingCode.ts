import { randomBytes } from "node:crypto";

/**
 * Tracking code generator for public incident lookup.
 *
 * Format: `CERRT-XXXX-XXXX` — 8 characters from an unambiguous alphabet
 * (no 0/1/O/I/L), grouped for readability.
 *
 * Entropy: 31^8 ≈ 8.5 × 10^11 combinations — far more than enough to
 * make brute-force enumeration infeasible, especially combined with the
 * email-verification second factor on the lookup page.
 */

const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export function generateTrackingCode(): string {
  const bytes = randomBytes(8);
  let chars = "";
  for (let i = 0; i < 8; i++) {
    chars += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return `CERRT-${chars.slice(0, 4)}-${chars.slice(4, 8)}`;
}

/**
 * Strict validator for tracking codes — used by the public lookup
 * endpoint to reject malformed input before hitting the database.
 */
export function isValidTrackingCode(code: string): boolean {
  return /^CERRT-[A-Z2-9]{4}-[A-Z2-9]{4}$/.test(code);
}

/**
 * Normalize user-entered tracking codes (uppercase, trim).
 */
export function normalizeTrackingCode(code: string): string {
  return code.trim().toUpperCase();
}
