"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  Calendar01Icon,
  IdentificationIcon,
  Shield01Icon,
  InformationCircleIcon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  BubbleChatIcon,
  File02Icon,
} from "@hugeicons/core-free-icons";
import {
  getPersonalIncidentDetailAction,
  type PersonalIncidentDetail,
} from "@/app/actions/personalAccess";

function getStatusBadge(status: string) {
  switch (status) {
    case "new":
      return {
        label: "New / Submitted",
        classes: "bg-blue-50 text-blue-700 border-blue-200",
        icon: InformationCircleIcon,
      };
    case "reviewing":
      return {
        label: "Under Review / Active",
        classes: "bg-amber-50 text-amber-700 border-amber-200",
        icon: Clock01Icon,
      };
    case "resolved":
      return {
        label: "Resolved",
        classes: "bg-emerald-50 text-emerald-700 border-emerald-200",
        icon: CheckmarkCircle02Icon,
      };
    case "closed":
      return {
        label: "Closed",
        classes: "bg-gray-100 text-gray-700 border-gray-200",
        icon: CheckmarkCircle02Icon,
      };
    default:
      return {
        label: status,
        classes: "bg-gray-100 text-gray-700 border-gray-200",
        icon: InformationCircleIcon,
      };
  }
}

function getSeverityBadge(severity: string) {
  switch (severity) {
    case "critical":
      return "bg-destructive text-white";
    case "high":
      return "bg-warning text-white";
    case "medium":
      return "bg-accent text-white";
    case "low":
      return "bg-muted text-muted-foreground";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function formatDate(dateInput: Date | string) {
  const d = new Date(dateInput);
  return new Intl.DateTimeFormat("en-NG", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export default function PersonalIncidentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const [loading, setLoading] = useState(true);
  const [incident, setIncident] = useState<PersonalIncidentDetail | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    getPersonalIncidentDetailAction(resolvedParams.id)
      .then((res) => {
        if (!res.success) {
          setErrorMessage(res.error || "Failed to load report.");
        } else {
          setIncident(res.incident || null);
        }
      })
      .catch((err) => setErrorMessage((err as Error).message || "Failed to load report."))
      .finally(() => setLoading(false));
  }, [resolvedParams.id]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (errorMessage || !incident) {
    const isUnauthorized = errorMessage.includes("Unauthorized");
    return (
      <main className="min-h-screen bg-gray-50/50 py-16 px-4">
        <div className="max-w-xl mx-auto bg-white rounded-3xl p-8 border border-border text-center shadow-sm">
          <div className="w-14 h-14 bg-amber-50 text-amber-600 border border-amber-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <HugeiconsIcon icon={InformationCircleIcon} size={28} />
          </div>
          <h1 className="text-xl font-bold mb-2 font-serif">
            {isUnauthorized ? "Session Expired" : "Report Not Found"}
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            {isUnauthorized
              ? "Your 1-hour verification session has expired. Please verify your email address again to access this report."
              : errorMessage || "Unable to access this incident report."}
          </p>
          <Link
            href={isUnauthorized ? "/my-reports" : "/my-reports/cases"}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-bold text-sm rounded-xl hover:bg-primary-light transition-all"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={18} />
            <span>{isUnauthorized ? "Re-verify Email" : "Back to My Reports"}</span>
          </Link>
        </div>
      </main>
    );
  }

  const statusBadge = getStatusBadge(incident.status);
  const StatusIcon = statusBadge.icon;

  return (
    <main className="min-h-screen bg-gray-50/50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link
          href="/my-reports/cases"
          className="inline-flex items-center text-sm font-semibold text-muted-foreground hover:text-primary transition-colors mb-6"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={18} className="mr-1.5" />
          Back to All My Reports
        </Link>

        {/* Incident Header Card */}
        <div className="bg-white rounded-3xl p-8 border border-border shadow-sm mb-8 animate-slide-in-up">
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold border ${statusBadge.classes}`}>
              <HugeiconsIcon icon={StatusIcon} size={14} />
              {statusBadge.label}
            </span>

            <span className={`px-3.5 py-1 rounded-full text-xs font-bold uppercase ${getSeverityBadge(incident.severity)}`}>
              {incident.severity} Severity
            </span>

            <span className="sm:ml-auto text-xs font-bold text-primary bg-primary/10 px-3.5 py-1 rounded-full flex items-center gap-1.5">
              <HugeiconsIcon icon={IdentificationIcon} size={16} />
              Case ID: {incident.ticketId || incident.thehiveCaseId || incident.id}
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-foreground font-serif mb-4 leading-tight">
            {incident.title || `Incident Report (${incident.type})`}
          </h1>

          <div className="flex items-center gap-6 text-xs text-muted-foreground flex-wrap pt-2 border-t border-border">
            <span className="flex items-center gap-1.5 font-medium">
              <HugeiconsIcon icon={Calendar01Icon} size={16} />
              Submitted: {formatDate(incident.submittedAt)}
            </span>
            <span className="font-medium">
              Organization: <strong className="text-foreground">{incident.organization || "N/A"}</strong>
            </span>
            <span className="font-medium">
              Type: <strong className="text-foreground capitalize">{incident.type}</strong>
            </span>
          </div>
        </div>

        {/* Description Section */}
        <section className="bg-white rounded-3xl p-8 border border-border shadow-sm mb-8 animate-slide-in-up">
          <h2 className="text-lg font-bold text-foreground mb-4 border-b border-border pb-4 font-serif">
            Report Description
          </h2>
          <p className="text-muted-foreground text-sm whitespace-pre-wrap leading-relaxed">
            {incident.description}
          </p>
        </section>

        {/* Communication & Analyst Notes Timeline */}
        <section className="bg-white rounded-3xl p-8 border border-border shadow-sm animate-slide-in-up">
          <div className="flex items-center gap-2 mb-6 border-b border-border pb-4">
            <HugeiconsIcon icon={BubbleChatIcon} size={22} className="text-primary" />
            <h2 className="text-lg font-bold text-foreground font-serif">
              Analyst Updates & Activity Timeline
            </h2>
          </div>

          {!incident.caseCommunications || incident.caseCommunications.length === 0 ? (
            <div className="p-6 bg-muted/20 rounded-2xl text-center text-sm text-muted-foreground">
              No analyst activity or notes logged yet. We will notify you when updates occur.
            </div>
          ) : (
            <div className="space-y-6 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
              {incident.caseCommunications.map((comm) => (
                <div key={comm.id} className="relative pl-10">
                  <div
                    className={`absolute left-0 top-1 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                      comm.senderType === "analyst"
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted text-muted-foreground border-border"
                    }`}
                  >
                    <HugeiconsIcon
                      icon={comm.senderType === "analyst" ? Shield01Icon : BubbleChatIcon}
                      size={14}
                    />
                  </div>

                  <div className="bg-muted/10 border border-border rounded-2xl p-5 space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground flex-wrap">
                      <span className="font-bold text-foreground">
                        {comm.senderType === "analyst" ? "CERRT Analyst" : "Reporter Response"}
                      </span>
                      <span>{formatDate(comm.createdAt)}</span>
                    </div>

                    <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                      {comm.messageBody}
                    </p>

                    {comm.attachments && comm.attachments.length > 0 && (
                      <div className="pt-3 border-t border-border/60">
                        <span className="text-xs font-bold text-muted-foreground block mb-2">
                          Attached Files ({comm.attachments.length}):
                        </span>
                        <div className="flex gap-2 flex-wrap">
                          {comm.attachments.map((att, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-border rounded-lg text-xs font-medium text-foreground"
                            >
                              <HugeiconsIcon icon={File02Icon} size={14} className="text-primary" />
                              {att.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
