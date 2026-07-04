"use client";

import { useState } from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { MailAtSign02Icon } from "@hugeicons/core-free-icons";
import { requestPasswordResetAction } from "@/app/actions/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await requestPasswordResetAction(email);
      // Always show success — the action itself doesn't reveal
      // whether the email actually exists.
      setSubmitted(true);
    } catch (err) {
      setError((err as Error).message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-primary/10 to-secondary pattern-dots">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-2xl border-2 border-border p-8">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <HugeiconsIcon
                icon={MailAtSign02Icon}
                size={32}
                color="currentColor"
                className="text-primary"
              />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-center text-gray-900 mb-2 font-serif">
            Forgot your password?
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Enter your email and we&apos;ll send you a reset link.
          </p>

          {submitted ? (
            <div className="text-center space-y-6">
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 text-sm text-green-800">
                If an account exists for <strong>{email}</strong>, we&apos;ve sent a
                password reset link. Check your inbox — and the spam folder just
                in case. The link expires in 1 hour.
              </div>
              <Link
                href="/admin/login"
                className="inline-block text-sm text-primary hover:underline font-semibold"
              >
                ← Back to login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  maxLength={254}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>

              {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white py-3 px-4 rounded-lg font-bold hover:bg-primary-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Sending..." : "Send reset link"}
              </button>

              <div className="text-center">
                <Link
                  href="/admin/login"
                  className="text-sm text-primary hover:underline font-semibold"
                >
                  ← Back to login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
