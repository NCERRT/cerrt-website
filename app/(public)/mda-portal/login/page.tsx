"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Building02Icon,
  Mail01Icon,
  LockKeyIcon,
  ArrowRight01Icon,
  Alert02Icon,
  ViewIcon,
  ViewOffIcon,
  Shield01Icon,
} from "@hugeicons/core-free-icons";

import { getMdaSessionAction, mdaLoginAction } from "@/app/actions/mdaAuth";

export default function MdaLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    // Auto-redirect if MDA session is already active
    getMdaSessionAction().then((session) => {
      if (session) {
        router.push("/mda-portal");
      }
    });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const result = await mdaLoginAction({ email, password });
      if (result.success) {
        router.push("/mda-portal");
      } else {
        setErrorMessage(result.error);
      }
    } catch {
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100/60 py-12 sm:py-20 flex flex-col justify-center">
      <div className="max-w-md w-full mx-auto px-4 sm:px-6">
        {/* Header Badge & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 text-primary mb-4 shadow-sm">
            <HugeiconsIcon icon={Building02Icon} size={28} />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            MDA Portal Login
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Access your official agency incident dashboard and case communications.
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-white border border-slate-200/80 shadow-xl shadow-slate-200/50 rounded-3xl p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {errorMessage && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start space-x-3 text-red-700 text-sm">
                <HugeiconsIcon icon={Alert02Icon} size={20} className="shrink-0 mt-0.5 text-red-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Official Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <HugeiconsIcon icon={Mail01Icon} size={18} />
                </div>
                <input
                  type="email"
                  required
                  placeholder="officer@agency.gov.ng"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50/50 border border-slate-300 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <HugeiconsIcon icon={LockKeyIcon} size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50/50 border border-slate-300 rounded-xl pl-10 pr-11 py-3 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  <HugeiconsIcon icon={showPassword ? ViewOffIcon : ViewIcon} size={18} />
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center items-center py-3.5 px-6 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-primary/20 cursor-pointer"
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span>Sign In to MDA Portal</span>
                    <HugeiconsIcon icon={ArrowRight01Icon} size={18} />
                  </div>
                )}
              </button>
            </div>

            <div className="border-t border-slate-100 pt-4 text-center space-y-2">
              <p className="text-xs text-slate-600">
                Need an official portal account for your agency?{" "}
                <Link href="/mda-portal/register" className="text-primary hover:underline font-semibold">
                  Apply for MDA Self-Registration
                </Link>
              </p>
            </div>
          </form>
        </div>

        <div className="text-center mt-6 text-xs text-slate-400 flex items-center justify-center space-x-1.5">
          <HugeiconsIcon icon={Shield01Icon} size={14} className="text-primary" />
          <span>NITDA CERRT Secure Government Gateway</span>
        </div>
      </div>
    </div>
  );
}
