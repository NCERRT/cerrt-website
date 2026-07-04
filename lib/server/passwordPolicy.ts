/**
 * Password policy validation (NIST SP 800-63B aligned).
 *
 * Pure logic + a call to the public HIBP API — safe to import from
 * both the Next.js server runtime and standalone scripts (e.g. create-admin).
 *
 * - Minimum length: 12 characters
 * - Maximum length: 128 characters
 * - Checked against the Have I Been Pwned (HIBP) breach database
 * - No arbitrary complexity rules (NIST guidance: length over complexity)
 */

export interface PasswordValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Structural validation only (no network calls).
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
    return { valid: false, error: "Password must not exceed 128 characters" };
  }
  if (password.trim().length === 0) {
    return { valid: false, error: "Password cannot be only whitespace" };
  }
  return { valid: true };
}

/**
 * SHA-1 hash (used for the HIBP k-anonymity check).
 */
async function sha1(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-1", msgBuffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

/**
 * Check a password against the Have I Been Pwned breach database.
 * Uses k-anonymity: only the first 5 characters of the SHA-1 hash are sent.
 * Fails open (returns not-pwned) if the API is unreachable.
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

    const response = await fetch(
      `https://api.pwnedpasswords.com/range/${prefix}`,
      {
        headers: {
          "User-Agent": "CERRT-Security-Check",
          "Add-Padding": "true",
        },
        signal: AbortSignal.timeout(3000),
      },
    );

    if (!response.ok) {
      console.warn(`HIBP API returned ${response.status}`);
      return { pwned: false, apiAvailable: false };
    }

    const text = await response.text();
    for (const line of text.split("\n")) {
      const [hashSuffix, countStr] = line.split(":");
      if (hashSuffix?.trim().toUpperCase() === suffix) {
        return {
          pwned: true,
          count: parseInt(countStr?.trim() || "0", 10),
          apiAvailable: true,
        };
      }
    }
    return { pwned: false, apiAvailable: true };
  } catch (error) {
    console.warn("HIBP check failed:", error);
    return { pwned: false, apiAvailable: false };
  }
}

/**
 * Full password validation: structure + breach check.
 */
export async function validatePassword(
  password: string,
): Promise<PasswordValidationResult> {
  const structureCheck = validatePasswordStructure(password);
  if (!structureCheck.valid) {
    return structureCheck;
  }

  const hibpResult = await checkHIBP(password);
  if (hibpResult.pwned) {
    const count = (hibpResult.count || 0).toLocaleString();
    return {
      valid: false,
      error: `This password has appeared in ${count} known data breaches. Please choose a different password.`,
    };
  }

  return { valid: true };
}
