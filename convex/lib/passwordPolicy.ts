/**
 * Password policy validation (NIST SP 800-63B aligned)
 *
 * Approach:
 * - Minimum length: 12 characters (NIST recommends 8+, we use 12 for admin)
 * - Maximum length: 128 characters (prevent DoS)
 * - Check against Have I Been Pwned (HIBP) breach database
 * - No complexity requirements (NIST guidance: length > complexity)
 */

export interface PasswordValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Basic structural password validation (no API calls)
 * Safe to use in both mutations and actions
 */
export function validatePasswordStructure(
  password: string,
): PasswordValidationResult {
  if (!password) {
    return { valid: false, error: "Password is required" };
  }

  if (password.length < 12) {
    return {
      valid: false,
      error: "Password must be at least 12 characters long",
    };
  }

  if (password.length > 128) {
    return {
      valid: false,
      error: "Password must not exceed 128 characters",
    };
  }

  // Reject passwords that are just whitespace
  if (password.trim().length === 0) {
    return {
      valid: false,
      error: "Password cannot be only whitespace",
    };
  }

  return { valid: true };
}

/**
 * Compute SHA-1 hash of a string (for HIBP check)
 * Uses Web Crypto API (available in Convex actions)
 */
async function sha1(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-1", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

/**
 * Check if password has been exposed in a known data breach
 * Uses Have I Been Pwned Pwned Passwords API with k-anonymity
 *
 * Privacy: Only the first 5 characters of the SHA-1 hash are sent.
 * The actual password is never transmitted.
 *
 * @returns Object with `pwned: boolean` and optional `count` (breach occurrences)
 *          Returns `pwned: false` on API errors (fail-open to avoid blocking legitimate users)
 */
export async function checkHIBP(password: string): Promise<{
  pwned: boolean;
  count?: number;
  apiAvailable: boolean;
}> {
  try {
    const hash = await sha1(password);
    const prefix = hash.slice(0, 5);
    const suffix = hash.slice(5);

    // Call HIBP API with k-anonymity (only send first 5 chars)
    const response = await fetch(
      `https://api.pwnedpasswords.com/range/${prefix}`,
      {
        headers: {
          "User-Agent": "CERRT-Security-Check",
          "Add-Padding": "true", // Request padding to prevent traffic analysis
        },
        // 3 second timeout - don't block signup if API is slow
        signal: AbortSignal.timeout(3000),
      },
    );

    if (!response.ok) {
      console.warn(`HIBP API returned ${response.status}`);
      return { pwned: false, apiAvailable: false };
    }

    const text = await response.text();
    const lines = text.split("\n");

    for (const line of lines) {
      const [hashSuffix, countStr] = line.split(":");
      if (hashSuffix?.trim().toUpperCase() === suffix) {
        const count = parseInt(countStr?.trim() || "0", 10);
        return { pwned: true, count, apiAvailable: true };
      }
    }

    return { pwned: false, apiAvailable: true };
  } catch (error) {
    // If HIBP API fails, don't block the user (fail-open)
    console.warn("HIBP check failed:", error);
    return { pwned: false, apiAvailable: false };
  }
}

/**
 * Complete password validation (structure + breach check)
 * Must be called from an action (uses fetch)
 */
export async function validatePassword(
  password: string,
): Promise<PasswordValidationResult> {
  // Structural validation first (fast, no API call)
  const structureCheck = validatePasswordStructure(password);
  if (!structureCheck.valid) {
    return structureCheck;
  }

  // Breach check via HIBP
  const hibpResult = await checkHIBP(password);

  if (hibpResult.pwned) {
    const count = hibpResult.count || 0;
    const countFormatted = count.toLocaleString();
    return {
      valid: false,
      error: `This password has appeared in ${countFormatted} known data breaches. Please choose a different password.`,
    };
  }

  return { valid: true };
}
