"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Mail01Icon,
  Shield01Icon,
  ArrowRight01Icon,
  CheckmarkCircle02Icon,
  Alert02Icon,
  Clock01Icon,
} from "@hugeicons/core-free-icons";
import {
  requestOtpAction,
  verifyOtpAction,
  getVerifiedPersonalEmail,
} from "@/app/actions/personalAccess";

export default function MyReportsAuthPage() {
  const router = useRouter();

  // Step 1: "email" | Step 2: "otp"
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Countdown timer for resending OTP
  const [resendCooldown, setResendCooldown] = useState(0);

  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Check if user already has a valid personal session
    getVerifiedPersonalEmail().then((verifiedEmail) => {
      if (verifiedEmail) {
        router.push("/my-reports/cases");
      }
    });
  }, [router]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!email.trim()) {
      setErrorMessage("Please enter your email address.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await requestOtpAction(email.trim());
      if (!res.success) {
        setErrorMessage(res.error || "Failed to send verification code.");
        return;
      }
      setSuccessMessage(res.message || "Verification code sent.");
      setStep("otp");
      setResendCooldown(60);
      // Auto-focus first OTP digit box after render
      setTimeout(() => otpInputsRef.current[0]?.focus(), 100);
    } catch (err) {
      setErrorMessage((err as Error).message || "Failed to send verification code.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDigitChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);

    // Auto-advance to next input
    if (value && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (!/^\d{6}$/.test(pastedData)) return;

    const digits = pastedData.split("");
    setOtpDigits(digits);
    otpInputsRef.current[5]?.focus();
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const code = otpDigits.join("");
    if (code.length !== 6) {
      setErrorMessage("Please enter all 6 digits of the verification code.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await verifyOtpAction(email.trim(), code);
      if (!res.success) {
        setErrorMessage(res.error || "Verification failed. Please try again.");
        return;
      }
      router.push("/my-reports/cases");
    } catch (err) {
      setErrorMessage((err as Error).message || "Verification failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-[80vh] flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 bg-muted/20">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 md:p-10 shadow-lg border border-border animate-slide-in-up">
        {/* Header Icon & Title */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary/20">
            <HugeiconsIcon icon={Shield01Icon} size={32} className="text-primary" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground font-serif mb-2">
            My Incident Reports
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {step === "email"
              ? "Check the status and progress of incidents you have submitted."
              : `Enter the 6-digit code sent to ${email}`}
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-start gap-3 text-destructive text-sm animate-fade-in">
            <HugeiconsIcon icon={Alert02Icon} size={20} className="shrink-0 mt-0.5" />
            <p className="font-medium">{errorMessage}</p>
          </div>
        )}

        {/* Success Alert */}
        {successMessage && step === "otp" && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3 text-emerald-800 text-sm animate-fade-in">
            <HugeiconsIcon icon={CheckmarkCircle02Icon} size={20} className="shrink-0 mt-0.5 text-emerald-600" />
            <p className="font-medium">{successMessage}</p>
          </div>
        )}

        {/* STEP 1: EMAIL ENTRY */}
        {step === "email" && (
          <form onSubmit={handleRequestOtp} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Reporter Email Address
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@organization.gov.ng"
                  className="w-full pl-11 pr-4 py-3.5 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm bg-muted/10 font-medium"
                />
                <HugeiconsIcon
                  icon={Mail01Icon}
                  size={20}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Must match the email address provided when filing the incident report.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary-light transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Sending Code...</span>
                </>
              ) : (
                <>
                  <span>Send Verification Code</span>
                  <HugeiconsIcon icon={ArrowRight01Icon} size={18} />
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: 6-DIGIT OTP ENTRY */}
        {step === "otp" && (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 text-center">
                6-Digit Security Code
              </label>
              <div className="flex justify-between gap-2 sm:gap-3" onPaste={handlePaste}>
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      otpInputsRef.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold border-2 border-border rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-muted/10 transition-all"
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || otpDigits.join("").length !== 6}
              className="w-full py-3.5 px-6 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary-light transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Verifying Code...</span>
                </>
              ) : (
                <span>Verify & View Reports</span>
              )}
            </button>

            {/* Resend & Change Email Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-border text-xs text-muted-foreground">
              <button
                type="button"
                onClick={() => {
                  setStep("email");
                  setOtpDigits(["", "", "", "", "", ""]);
                  setErrorMessage("");
                  setSuccessMessage("");
                }}
                className="hover:text-primary transition-colors font-semibold"
              >
                Change Email
              </button>

              <button
                type="button"
                disabled={resendCooldown > 0 || isSubmitting}
                onClick={handleRequestOtp}
                className="hover:text-primary transition-colors font-semibold disabled:opacity-50 flex items-center gap-1"
              >
                <HugeiconsIcon icon={Clock01Icon} size={14} />
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend Code"}
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
