"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  Alert02Icon,
  ArrowRight01Icon,
  Building02Icon,
  CheckmarkCircle02Icon,
  Shield01Icon,
} from "@hugeicons/core-free-icons";

import { getMdaSessionAction } from "@/app/actions/mdaAuth";
import { submitMdaIncidentReportAction } from "@/app/actions/mdaPortal";
import type { AuthenticatedMdaUser } from "@/lib/server/mdaAuth";

const INCIDENT_TYPES = [
  "Ransomware / Extortion",
  "Malware Outbreak",
  "Data Breach / Leak",
  "Denial of Service (DDoS)",
  "Unauthorized Access / Defacement",
  "Phishing / Social Engineering",
  "Insider Threat",
  "System Vulnerability / Compromise",
  "Other Security Incident",
];

const SEVERITIES = [
  { value: "low", label: "Low", desc: "Minor anomaly with no system disruption" },
  { value: "medium", label: "Medium", desc: "Limited impact on non-critical systems" },
  { value: "high", label: "High", desc: "Significant disruption or suspected data compromise" },
  { value: "critical", label: "Critical", desc: "Severe operational outage or active breach" },
];

export default function MdaReportIncidentPage() {
  const [user, setUser] = useState<AuthenticatedMdaUser | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    type: INCIDENT_TYPES[0],
    severity: "medium" as "low" | "medium" | "high" | "critical",
    description: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  useEffect(() => {
    getMdaSessionAction().then((session) => {
      if (session) {
        setUser(session);
        setFormData((prev) => ({
          ...prev,
          contactName: session.contactName,
          contactEmail: session.email,
          contactPhone: session.phone || "",
        }));
      }
    });
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (formData.description.trim().length < 10) {
      setErrorMessage("Please provide a detailed incident description (at least 10 characters).");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await submitMdaIncidentReportAction({
        title: formData.title || undefined,
        type: formData.type,
        severity: formData.severity,
        description: formData.description,
        contactName: formData.contactName,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone,
      });

      if (result.success && result.data) {
        setSubmittedId(result.data.id);
      } else if (!result.success) {
        setErrorMessage(result.error);
      }
    } catch {
      setErrorMessage("Failed to submit incident report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="border-b border-gray-200 pb-5">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-2">
          <HugeiconsIcon icon={Building02Icon} size={14} />
          <span>{user?.organizationName}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
          <HugeiconsIcon icon={Add01Icon} size={24} className="text-primary" />
          Report Security Incident
        </h1>
        <p className="text-xs text-gray-600 mt-1">
          Submit an official incident alert directly to the NITDA CERRT Security Operations Center (SOC).
        </p>
      </div>

      {submittedId ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center space-y-5 shadow-xs">
          <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mx-auto">
            <HugeiconsIcon icon={CheckmarkCircle02Icon} size={36} />
          </div>

          <h2 className="text-2xl font-bold text-gray-900">Incident Reported Successfully</h2>
          <p className="text-sm text-gray-600 max-w-md mx-auto">
            Your incident report has been registered and assigned to SOC analysts for immediate review and ingestion into TheHive case management engine.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Link
              href={`/mda-portal/cases/${submittedId}`}
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl text-xs font-bold bg-primary hover:bg-primary-light text-primary-foreground transition-all shadow-xs"
            >
              <span>View Case Detail</span>
              <HugeiconsIcon icon={ArrowRight01Icon} size={16} className="ml-1.5" />
            </Link>
            <Link
              href="/mda-portal/cases"
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-800 transition-all border border-gray-200"
            >
              All Agency Cases
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start space-x-3 text-red-700 text-sm">
              <HugeiconsIcon icon={Alert02Icon} size={20} className="shrink-0 mt-0.5 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Pre-populated Agency Info Banner */}
          <div className="bg-slate-50 border border-gray-200 rounded-xl p-4 text-xs text-gray-700 space-y-1.5">
            <div className="font-bold text-gray-900 flex items-center space-x-1.5 mb-1">
              <HugeiconsIcon icon={Shield01Icon} size={14} className="text-primary" />
              <span>Pre-Filled Official Agency Context:</span>
            </div>
            <p><strong>Organization:</strong> {user?.organizationName} ({user?.acronym || "MDA"})</p>
            <p><strong>Reporting Officer:</strong> {user?.contactName} ({user?.email})</p>
          </div>

          {/* Incident Type & Title */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">
                Incident Category / Type <span className="text-red-500">*</span>
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full bg-gray-50/50 border border-gray-300 rounded-xl px-4 py-2.5 text-xs text-gray-900 focus:bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-xs"
              >
                {INCIDENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">
                Incident Title (Optional)
              </label>
              <input
                type="text"
                name="title"
                placeholder="e.g. Ransomware attack targeting server DB-02"
                value={formData.title}
                onChange={handleChange}
                className="w-full bg-gray-50/50 border border-gray-300 rounded-xl px-4 py-2.5 text-xs text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-xs"
              />
            </div>
          </div>

          {/* Severity Radio Cards */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">
              Assessed Severity Level <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SEVERITIES.map((s) => (
                <label
                  key={s.value}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start space-x-3 ${
                    formData.severity === s.value
                      ? "border-2 border-slate-900 bg-slate-50/60 shadow-xs"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="severity"
                    value={s.value}
                    checked={formData.severity === s.value}
                    onChange={handleChange}
                    className="mt-0.5 text-primary focus:ring-primary"
                  />
                  <div>
                    <div className="text-xs font-bold text-gray-900 capitalize">{s.label} Severity</div>
                    <p className="text-[11px] text-gray-500 mt-0.5">{s.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Detailed Description */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">
              Detailed Description & Indicators of Compromise (IOCs) <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={5}
              name="description"
              required
              placeholder="Describe the nature of the incident, affected systems/IP addresses, timeline of detection, and any initial containment actions taken..."
              value={formData.description}
              onChange={handleChange}
              className="w-full bg-gray-50/50 border border-gray-300 rounded-xl p-4 text-xs text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-xs"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center items-center py-3.5 px-6 border border-transparent rounded-xl shadow-xs text-xs font-bold text-primary-foreground bg-primary hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Submitting Incident Alert...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span>Submit Official Incident Alert to CERRT SOC</span>
                  <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
                </div>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
