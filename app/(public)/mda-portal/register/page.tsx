"use client";

import { useState } from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Building01Icon,
  UserIcon,
  Mail01Icon,
  CallIcon,
  LockKeyIcon,
  CheckmarkCircle02Icon,
  Alert02Icon,
  ArrowRight01Icon,
  Shield01Icon,
  Building02Icon,
  ViewIcon,
  ViewOffIcon,
} from "@hugeicons/core-free-icons";

import { submitMdaRegistrationAction } from "@/app/actions/mdaRegistration";

const SECTORS = [
  "Federal Ministry / Agency",
  "State Government / Ministry",
  "Defence & Security",
  "Finance & Banking",
  "Health & Social Welfare",
  "Education & Research",
  "Energy & Power",
  "Telecommunications & Tech",
  "Transportation & Infrastructure",
  "Other Public Institution",
];

export default function MdaRegistrationPage() {
  const [formData, setFormData] = useState({
    organizationName: "",
    acronym: "",
    sector: SECTORS[0],
    contactName: "",
    contactEmail: "",
    jobTitle: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match. Please verify your password.");
      return;
    }

    if (formData.password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }

    if (!/[A-Z]/.test(formData.password) || !/[0-9]/.test(formData.password)) {
      setErrorMessage("Password must contain at least one uppercase letter and one number.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await submitMdaRegistrationAction({
        organizationName: formData.organizationName,
        acronym: formData.acronym || undefined,
        sector: formData.sector,
        contactName: formData.contactName,
        contactEmail: formData.contactEmail,
        jobTitle: formData.jobTitle,
        phone: formData.phone || undefined,
        password: formData.password,
      });

      if (result.success) {
        setIsSubmitted(true);
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100/60 py-12 sm:py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Badge & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 text-primary mb-4 shadow-sm">
            <HugeiconsIcon icon={Building02Icon} size={28} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            MDA Self-Registration
          </h1>
          <p className="mt-3 text-base text-slate-600 max-w-xl mx-auto">
            Apply for official MDA Portal access for your ministry, department, or agency to securely report incidents and track response progress.
          </p>
        </div>

        {/* Card Form Container */}
        <div className="bg-white border border-slate-200/80 shadow-xl shadow-slate-200/50 rounded-3xl p-6 sm:p-10">
          {isSubmitted ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 border border-primary/20 text-primary mb-6">
                <HugeiconsIcon icon={CheckmarkCircle02Icon} size={36} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-3">Registration Submitted</h2>
              <p className="text-slate-600 text-sm leading-relaxed mb-6 max-w-lg mx-auto">
                Thank you for applying. Your MDA portal registration for{" "}
                <strong className="text-primary">{formData.organizationName}</strong> has been
                received and is currently under review by the CERRT Administration.
              </p>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left text-xs text-slate-600 space-y-2 mb-8 max-w-md mx-auto">
                <div className="flex items-center space-x-2 text-slate-900 font-semibold text-sm mb-2">
                  <HugeiconsIcon icon={Shield01Icon} size={18} className="text-primary" />
                  <span>Next Steps:</span>
                </div>
                <p>1. CERRT Superadmin will verify your official agency credentials.</p>
                <p>2. An approval notification email will be sent to <strong className="text-slate-800">{formData.contactEmail}</strong>.</p>
                <p>3. Once approved, you can log in to view your agency case dashboard.</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/mda-portal/login"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-xl text-sm font-semibold bg-primary hover:bg-primary-light text-primary-foreground transition-all shadow-lg shadow-primary/20"
                >
                  Go to MDA Portal Login
                  <HugeiconsIcon icon={ArrowRight01Icon} size={16} className="ml-2" />
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-xl text-sm font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all"
                >
                  Return to Home
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {errorMessage && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start space-x-3 text-red-700 text-sm">
                  <HugeiconsIcon icon={Alert02Icon} size={20} className="shrink-0 mt-0.5 text-red-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Organization Section */}
              <div className="border-b border-slate-100 pb-6">
                <h2 className="text-xs font-bold text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
                  <HugeiconsIcon icon={Building01Icon} size={18} />
                  Organization Details
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-2">
                      Organization Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="organizationName"
                      required
                      placeholder="e.g. Federal Inland Revenue Service"
                      value={formData.organizationName}
                      onChange={handleChange}
                      className="w-full bg-slate-50/50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">
                      Acronym
                    </label>
                    <input
                      type="text"
                      name="acronym"
                      placeholder="e.g. FIRS"
                      value={formData.acronym}
                      onChange={handleChange}
                      className="w-full bg-slate-50/50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                </div>

                <div className="mt-5">
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
                    Sector / Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="sector"
                    value={formData.sector}
                    onChange={handleChange}
                    className="w-full bg-slate-50/50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  >
                    {SECTORS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Contact Person Section */}
              <div className="border-b border-slate-100 pb-6">
                <h2 className="text-xs font-bold text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
                  <HugeiconsIcon icon={UserIcon} size={18} />
                  Contact Officer Credentials
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="contactName"
                      required
                      placeholder="e.g. Dr. Aliyu Bello"
                      value={formData.contactName}
                      onChange={handleChange}
                      className="w-full bg-slate-50/50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">
                      Job Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="jobTitle"
                      required
                      placeholder="e.g. Chief Information Security Officer"
                      value={formData.jobTitle}
                      onChange={handleChange}
                      className="w-full bg-slate-50/50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">
                      Official Email (.gov.ng / .mil.ng) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <HugeiconsIcon icon={Mail01Icon} size={18} />
                      </div>
                      <input
                        type="email"
                        name="contactEmail"
                        required
                        placeholder="officer@agency.gov.ng"
                        value={formData.contactEmail}
                        onChange={handleChange}
                        className="w-full bg-slate-50/50 border border-slate-300 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <HugeiconsIcon icon={CallIcon} size={18} />
                      </div>
                      <input
                        type="tel"
                        name="phone"
                        placeholder="+2348000000000"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full bg-slate-50/50 border border-slate-300 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Password Section with View Password Toggles */}
              <div className="space-y-4">
                <h2 className="text-xs font-bold text-primary uppercase tracking-wider mb-2 flex items-center gap-2">
                  <HugeiconsIcon icon={LockKeyIcon} size={18} />
                  Account Password
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        required
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full bg-slate-50/50 border border-slate-300 rounded-xl pl-4 pr-11 py-3 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
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

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        required
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full bg-slate-50/50 border border-slate-300 rounded-xl pl-4 pr-11 py-3 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                        title={showConfirmPassword ? "Hide password" : "Show password"}
                      >
                        <HugeiconsIcon icon={showConfirmPassword ? ViewOffIcon : ViewIcon} size={18} />
                      </button>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-slate-500">
                  Password must be at least 8 characters long and contain at least 1 uppercase letter and 1 number.
                </p>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex justify-center items-center py-3.5 px-6 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-primary/20 cursor-pointer"
                >
                  {isSubmitting ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Submitting Registration...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span>Submit Application for Review</span>
                      <HugeiconsIcon icon={ArrowRight01Icon} size={18} />
                    </div>
                  )}
                </button>
              </div>

              <div className="text-center pt-2">
                <p className="text-xs text-slate-600">
                  Already have an approved MDA account?{" "}
                  <Link href="/mda-portal/login" className="text-primary hover:underline font-semibold">
                    Log in here
                  </Link>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
