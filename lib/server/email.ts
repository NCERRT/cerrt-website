import "server-only";

import nodemailer from "nodemailer";

// ---------------------------------------------------------------------------
// Environment
// ---------------------------------------------------------------------------
const EMAIL_USER = process.env.EMAIL_USER!;
const EMAIL_APP_PASSWORD = process.env.EMAIL_APP_PASSWORD!;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

// ---------------------------------------------------------------------------
// Transporter (Gmail SMTP)
// ---------------------------------------------------------------------------
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_APP_PASSWORD,
  },
});

// ---------------------------------------------------------------------------
// Shared HTML helpers
// ---------------------------------------------------------------------------

/** Wraps email body content in a consistent branded layout. */
function layout(body: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>CERRT Admin</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f6f9;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f9;padding:32px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background-color:#1a365d;padding:28px 32px;text-align:center;">
              <h1 style="margin:0;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:0.5px;">
                CERRT Admin
              </h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;color:#2d3748;font-size:15px;line-height:1.7;">
              ${body}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;text-align:center;font-size:12px;color:#a0aec0;border-top:1px solid #e2e8f0;">
              &copy; ${new Date().getFullYear()} NITDA-CERRT &mdash; NITDA Computer Emergency Readiness &amp; Response Team
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}

// ---------------------------------------------------------------------------
// Exported email senders
// ---------------------------------------------------------------------------

/**
 * Sends an invitation email containing a temporary password.
 *
 * @param to   - Recipient email address
 * @param name - Recipient display name
 * @param tempPassword - The one-time temporary password
 */
export async function sendInviteEmail(
  to: string,
  name: string,
  tempPassword: string,
): Promise<void> {
  const loginUrl = `${APP_URL}/cerrt-ops/login`;

  const body = `
    <p style="margin:0 0 16px;">Hi <strong>${name}</strong>,</p>

    <p style="margin:0 0 16px;">
      You have been invited to join <strong>CERRT Admin</strong> as an
      administrator. Use the temporary password below to log in and get
      started.
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
      <tr>
        <td style="background-color:#edf2f7;border-left:4px solid #1a365d;padding:16px 20px;border-radius:4px;">
          <span style="display:block;font-size:12px;color:#718096;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">
            Email Address:
          </span>
          <span style="font-size:20px;font-weight:700;color:#1a365d;letter-spacing:1px;">
            ${to}
          </span>
        </td>
      </tr>
      <tr>
        <td style="background-color:#edf2f7;border-left:4px solid #1a365d;padding:16px 20px;border-radius:4px;">
          <span style="display:block;font-size:12px;color:#718096;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">
            Temporary Password:
          </span>
          <span style="font-size:20px;font-weight:700;color:#1a365d;letter-spacing:1px;">
            ${tempPassword}
          </span>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 24px;text-align:center;">
      <a href="${loginUrl}"
         style="display:inline-block;background-color:#1a365d;color:#ffffff;text-decoration:none;padding:12px 32px;border-radius:6px;font-weight:600;font-size:15px;">
        Log In to CERRT Admin
      </a>
    </p>

    <p style="margin:0 0 8px;font-size:13px;color:#718096;">
      This temporary password expires in <strong>72 hours</strong>.
    </p>
    <p style="margin:0;font-size:13px;color:#718096;">
      You will be required to change your password upon first login.
    </p>`;

  await transporter.sendMail({
    from: `CERRT Admin <${EMAIL_USER}>`,
    to,
    subject: "You've been invited to CERRT Admin",
    html: layout(body),
  });
}

/**
 * Sends a password-reset email with a one-time reset link.
 *
 * @param to       - Recipient email address
 * @param name     - Recipient display name
 * @param resetUrl - Full URL the recipient should visit to reset their password
 */
export async function sendPasswordResetEmail(
  to: string,
  name: string,
  resetUrl: string,
): Promise<void> {
  const body = `
    <p style="margin:0 0 16px;">Hi <strong>${name}</strong>,</p>

    <p style="margin:0 0 16px;">
      We received a request to reset the password for your CERRT Admin
      account. Click the button below to choose a new password.
    </p>

    <p style="margin:0 0 24px;text-align:center;">
      <a href="${resetUrl}"
         style="display:inline-block;background-color:#1a365d;color:#ffffff;text-decoration:none;padding:12px 32px;border-radius:6px;font-weight:600;font-size:15px;">
        Reset Password
      </a>
    </p>

    <p style="margin:0 0 8px;font-size:13px;color:#718096;">
      This link expires in <strong>1 hour</strong>.
    </p>
    <p style="margin:0;font-size:13px;color:#718096;">
      If you did not request a password reset, you can safely ignore this
      email &mdash; your password will remain unchanged.
    </p>`;

  await transporter.sendMail({
    from: `CERRT Admin <${EMAIL_USER}>`,
    to,
    subject: "CERRT Admin — Password Reset",
    html: layout(body),
  });
}

/**
 * Sends a 6-digit OTP verification code for personal access.
 *
 * @param to      - Recipient email address
 * @param otpCode - The 6-digit numeric verification code
 */
export async function sendOtpEmail(to: string, otpCode: string): Promise<void> {
  const body = `
    <p style="margin:0 0 16px;">Hello,</p>

    <p style="margin:0 0 16px;">
      You requested access to view your incident reports submitted to <strong>CERRT</strong>. Use the verification code below to complete your login.
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
      <tr>
        <td align="center" style="background-color:#edf2f7;border-left:4px solid #1a365d;padding:20px;border-radius:6px;">
          <span style="display:block;font-size:12px;color:#718096;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">
            Your Verification Code:
          </span>
          <span style="font-size:32px;font-weight:800;color:#1a365d;letter-spacing:6px;font-family:monospace;">
            ${otpCode}
          </span>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 8px;font-size:13px;color:#718096;">
      This verification code is valid for <strong>10 minutes</strong> and can only be used once.
    </p>
    <p style="margin:0;font-size:13px;color:#718096;">
      If you did not request this verification code, please ignore this message.
    </p>`;

  await transporter.sendMail({
    from: `CERRT <${EMAIL_USER}>`,
    to,
    subject: "CERRT — Your Incident Verification Code",
    html: layout(body),
  });
}
