"use client";

import { useState } from "react";
import {
  lookupIncidentTrackingAction,
  type IncidentTrackingResult,
} from "@/app/actions/incidentReports";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Search01Icon,
  Alert02Icon,
  CheckmarkCircle02Icon,
  Clock01Icon,
} from "@hugeicons/core-free-icons";

// Public-facing copy for each status (admin notes are NEVER shown here)
const STATUS_COPY: Record<
  IncidentTrackingResult["status"],
  { label: string; description: string; tone: "info" | "active" | "done" }
> = {
  new: {
    label: "Received",
    description:
      "Your report has been received and is in the queue for review.",
    tone: "info",
  },
  reviewing: {
    label: "Under review",
    description:
      "Our team is actively analysing the details of your report.",
    tone: "active",
  },
  resolved: {
    label: "Resolved",
    description:
      "Review has concluded and any required action has been taken.",
    tone: "done",
  },
  closed: {
    label: "Closed",
    description: "This report has been closed. No further action will be taken.",
    tone: "done",
  },
};

export default function TrackIncidentPage() {
  const [trackingCode, setTrackingCode] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<IncidentTrackingResult | null>(null);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setNotFound(false);
    setResult(null);

    try {
      const data = await lookupIncidentTrackingAction({ trackingCode, email });
      if (!data) {
        // Deliberately vague — don't reveal which field was wrong
        setNotFound(true);
      } else {
        setResult(data);
      }
    } catch (err) {
      setError((err as Error).message || "Lookup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat("en-NG", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);

  return (
    <main className="flex flex-col">
      {/* Hero */}
      <section className="bg-secondary py-20 pattern-dots relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center animate-slide-in-up">
          <div className="inline-block mb-6">
            <span className="text-primary font-semibold text-sm uppercase tracking-wider bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
              Track an Incident
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 font-serif leading-tight">
            Check the status of your{" "}
            <span className="text-primary">incident report</span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Enter the tracking code from your submission and the email you used.
            Both must match for the report to be shown.
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="py-16 bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <form
            onSubmit={handleSubmit}
            className="bg-white border-2 border-border rounded-2xl p-8 space-y-6 shadow-sm"
          >
            <div>
              <label
                htmlFor="trackingCode"
                className="block text-sm font-bold text-foreground mb-2"
              >
                Tracking code
              </label>
              <input
                id="trackingCode"
                name="trackingCode"
                type="text"
                value={trackingCode}
                onChange={(e) =>
                  setTrackingCode(e.target.value.toUpperCase())
                }
                required
                placeholder="CERRT-XXXX-XXXX"
                pattern="^CERRT-[A-Z2-9]{4}-[A-Z2-9]{4}$"
                title="Format: CERRT-XXXX-XXXX"
                maxLength={15}
                className="w-full px-4 py-3 bg-white border-2 border-border rounded-lg font-mono text-base tracking-wider focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
              />
              <p className="text-xs text-muted-foreground mt-1">
                You received this when you submitted your incident report.
              </p>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-bold text-foreground mb-2"
              >
                Email address used to report
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                maxLength={254}
                placeholder="you@example.com"
                className="w-full px-4 py-3 bg-white border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
              />
            </div>

            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-md text-destructive text-sm">
                {error}
              </div>
            )}

            {notFound && (
              <div className="p-4 bg-warning/10 border border-warning/30 rounded-md text-foreground text-sm">
                We couldn&apos;t find a report matching that tracking code and
                email. Please double-check both fields.
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
            >
              <HugeiconsIcon
                icon={Search01Icon}
                size={18}
                color="currentColor"
              />
              {loading ? "Checking..." : "Check status"}
            </button>
          </form>

          {/* Result */}
          {result && (
            <div className="mt-8 bg-white border-2 border-border rounded-2xl p-8 animate-slide-in-up">
              <StatusProgress status={result.status} />

              <dl className="mt-8 pt-8 border-t border-border grid sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                <div>
                  <dt className="text-muted-foreground uppercase tracking-wider text-xs font-semibold mb-1">
                    Tracking code
                  </dt>
                  <dd className="font-mono font-bold">{result.trackingCode}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground uppercase tracking-wider text-xs font-semibold mb-1">
                    Incident type
                  </dt>
                  <dd className="font-medium capitalize">
                    {result.type.replace(/-/g, " ")}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground uppercase tracking-wider text-xs font-semibold mb-1">
                    Severity
                  </dt>
                  <dd className="font-medium capitalize">{result.severity}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground uppercase tracking-wider text-xs font-semibold mb-1">
                    Submitted
                  </dt>
                  <dd className="font-medium">
                    {formatDate(result.submittedAt)}
                  </dd>
                </div>
                {result.reviewedAt && (
                  <div className="sm:col-span-2">
                    <dt className="text-muted-foreground uppercase tracking-wider text-xs font-semibold mb-1">
                      Last reviewed
                    </dt>
                    <dd className="font-medium">
                      {formatDate(result.reviewedAt)}
                    </dd>
                  </div>
                )}
              </dl>

              <p className="text-xs text-muted-foreground mt-6 pt-6 border-t border-border">
                Need urgent help? Call our emergency hotline:{" "}
                <strong>+234 (0) 817 4432</strong>
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function StatusProgress({
  status,
}: {
  status: IncidentTrackingResult["status"];
}) {
  // Map the 4 statuses onto a 3-step pipeline
  const currentStep =
    status === "new" ? 0 : status === "reviewing" ? 1 : 2;

  const finalLabel = status === "closed" ? "Closed" : "Resolved";
  const steps = [
    { label: "Received" },
    { label: "In Review" },
    { label: finalLabel },
  ];

  const copy = STATUS_COPY[status];

  return (
    <div>
      {/* Progress steps */}
      <div className="flex items-start">
        {steps.map((step, i) => {
          const isComplete = i < currentStep;
          const isActive = i === currentStep;
          const isLast = i === steps.length - 1;
          return (
            <div key={i} className="flex-1 flex items-start">
              <div className="flex flex-col items-center flex-shrink-0 w-24">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                    isComplete
                      ? "bg-primary text-primary-foreground"
                      : isActive
                        ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                        : "bg-white border-2 border-border text-muted-foreground"
                  }`}
                >
                  {isComplete ? (
                    <HugeiconsIcon
                      icon={CheckmarkCircle02Icon}
                      size={20}
                      color="currentColor"
                    />
                  ) : (
                    <span>{i + 1}</span>
                  )}
                </div>
                <div
                  className={`mt-2 text-xs font-semibold text-center ${
                    isActive
                      ? "text-primary"
                      : isComplete
                        ? "text-foreground"
                        : "text-muted-foreground"
                  }`}
                >
                  {step.label}
                </div>
              </div>
              {!isLast && (
                <div
                  className={`flex-1 h-0.5 mt-5 ${
                    i < currentStep ? "bg-primary" : "bg-border"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Current status description */}
      <div className="mt-8 flex items-start gap-3 p-4 bg-secondary/40 border border-border rounded-lg">
        <HugeiconsIcon
          icon={
            copy.tone === "done"
              ? CheckmarkCircle02Icon
              : copy.tone === "active"
                ? Clock01Icon
                : Alert02Icon
          }
          size={22}
          color="currentColor"
          className="text-primary flex-shrink-0 mt-0.5"
        />
        <div>
          <div className="font-bold text-foreground">{copy.label}</div>
          <div className="text-sm text-muted-foreground mt-0.5">
            {copy.description}
          </div>
        </div>
      </div>
    </div>
  );
}
