"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Alert02Icon, CancelCircleIcon } from "@hugeicons/core-free-icons";
import { incidentReportSchema, formatZodError } from "@/lib/schemas";
import { submitIncidentReportAction } from "@/app/actions/incidentReports";

interface ReportIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ReportIncidentModal({
  isOpen,
  onClose,
}: ReportIncidentModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    organization: "",
    incidentType: "security-breach",
    severity: "high" as "critical" | "high" | "medium" | "low",
    description: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">(
    "idle"
  );
  const [validationError, setValidationError] = useState<string>("");
  const [trackingCode, setTrackingCode] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    // Validate with Zod before submitting (immediate feedback)
    const parseResult = incidentReportSchema.safeParse({
      type: formData.incidentType,
      description: formData.description,
      contactName: formData.name,
      contactEmail: formData.email,
      contactPhone: formData.phone,
      organization: formData.organization,
      severity: formData.severity,
    });

    if (!parseResult.success) {
      setValidationError(formatZodError(parseResult.error));
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      const result = await submitIncidentReportAction(parseResult.data);

      setTrackingCode(result.trackingCode);
      setSubmitStatus("success");
      // Don't auto-close — the user needs to copy the tracking code first.
    } catch (error) {
      console.error("Error submitting report:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (submitStatus === "success") {
      setFormData({
        name: "",
        email: "",
        phone: "",
        organization: "",
        incidentType: "security-breach",
        severity: "high",
        description: "",
      });
      setSubmitStatus("idle");
      setTrackingCode("");
      setCopied(false);
    }
    onClose();
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(trackingCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard might be blocked — code is still visible on-screen
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div
        className="fixed inset-0"
        onClick={handleClose}
        aria-label="Close modal"
      />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-8 max-h-[calc(100vh-4rem)] overflow-y-auto border border-border animate-slide-in-up"
        style={{ animationDuration: '0.3s' }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b-2 border-border px-8 py-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center border-2 border-primary/20">
              <HugeiconsIcon
                icon={Alert02Icon}
                size={28}
                color="currentColor"
                className="text-primary"
              />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Report Security Incident
              </h2>
              <p className="text-sm text-muted-foreground font-medium flex items-center gap-2 mt-1">
                <span className="w-2 h-2 bg-success rounded-full animate-pulse"></span>
                Emergency Hotline: +234 (0) 817 4432
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2.5 hover:bg-muted rounded-full transition-all hover:rotate-90 hover:scale-110"
            aria-label="Close"
          >
            <HugeiconsIcon
              icon={CancelCircleIcon}
              size={24}
              color="currentColor"
              className="text-muted-foreground hover:text-foreground transition-colors"
            />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Warning Banner */}
          <div className="mb-8 p-5 bg-warning/10 border-2 border-warning/30 rounded-xl flex items-start gap-4">
            <div className="w-10 h-10 bg-warning/20 rounded-full flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-2xl">⚠️</span>
            </div>
            <div>
              <h4 className="font-bold text-warning mb-1">Critical Incidents</h4>
              <p className="text-sm text-foreground/80 font-medium leading-relaxed">
                For active/ongoing incidents requiring immediate response, please call
                our emergency hotline immediately at <strong className="text-warning">+234 (0) 817 4432</strong>.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {submitStatus !== "success" && (<>
            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Contact Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    maxLength={100}
                    className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    maxLength={254}
                    className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    maxLength={30}
                    className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    placeholder="+234 XXX XXX XXXX"
                  />
                </div>

                <div>
                  <label
                    htmlFor="organization"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Organization *
                  </label>
                  <input
                    type="text"
                    id="organization"
                    name="organization"
                    value={formData.organization}
                    onChange={handleChange}
                    required
                    maxLength={200}
                    className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    placeholder="Your organization"
                  />
                </div>
              </div>
            </div>

            {/* Incident Details */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Incident Details</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="incidentType"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Incident Type *
                  </label>
                  <select
                    id="incidentType"
                    name="incidentType"
                    value={formData.incidentType}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  >
                    <option value="security-breach">Security Breach</option>
                    <option value="malware">Malware Attack</option>
                    <option value="phishing">Phishing/Social Engineering</option>
                    <option value="ransomware">Ransomware</option>
                    <option value="data-leak">Data Leak</option>
                    <option value="ddos">DDoS Attack</option>
                    <option value="unauthorized-access">Unauthorized Access</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="severity"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Severity Level *
                  </label>
                  <select
                    id="severity"
                    name="severity"
                    value={formData.severity}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  >
                    <option value="critical">Critical - Active & Severe</option>
                    <option value="high">High - Significant Impact</option>
                    <option value="medium">Medium - Moderate Impact</option>
                    <option value="low">Low - Minor Impact</option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Incident Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={6}
                  maxLength={5000}
                  className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none text-sm"
                  placeholder="Please provide detailed information about the incident including:&#10;- What happened?&#10;- When did it occur?&#10;- What systems/data are affected?&#10;- Current status of the incident&#10;- Any immediate actions already taken"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {formData.description.length}/5000 characters
                </p>
              </div>
            </div>
            </>)}

            {/* Submit Status */}
            {validationError && (
              <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-md text-destructive text-sm">
                ⚠ {validationError}
              </div>
            )}

            {submitStatus === "success" && (
              <div className="p-6 bg-success/10 border-2 border-success/30 rounded-xl space-y-4">
                <div className="text-success font-semibold flex items-center gap-2">
                  ✓ Incident reported successfully
                </div>
                <p className="text-sm text-foreground/80">
                  Save your tracking code below — you&apos;ll use it (with the
                  email you provided) to check the status of your report at any
                  time.
                </p>
                <div className="bg-white rounded-lg border-2 border-success/40 p-4">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
                    Your tracking code
                  </div>
                  <div className="flex items-center gap-3">
                    <code className="flex-1 font-mono text-lg sm:text-xl font-bold text-foreground select-all break-all">
                      {trackingCode}
                    </code>
                    <button
                      type="button"
                      onClick={copyCode}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-semibold hover:bg-primary/90 transition-colors whitespace-nowrap"
                    >
                      {copied ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>
                <a
                  href="/track"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
                >
                  Track your report →
                </a>
              </div>
            )}

            {submitStatus === "error" && (
              <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-md text-destructive text-sm">
                ✗ Failed to submit report. Please try again or call our hotline.
              </div>
            )}

            {/* Actions */}
            {submitStatus === "success" ? (
              <div className="flex pt-6 border-t border-border">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 px-6 py-3 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 transition-all"
                >
                  Done
                </button>
              </div>
            ) : (
              <div className="flex gap-4 pt-6 border-t border-border">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 px-6 py-3 border-2 border-border text-foreground font-bold rounded-lg hover:bg-muted hover:border-primary transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group flex-1 px-6 py-3 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary-light hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isSubmitting ? "Submitting..." : "Submit Report"}
                    {!isSubmitting && (
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    )}
                  </span>
                  {!isSubmitting && (
                    <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  )}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
