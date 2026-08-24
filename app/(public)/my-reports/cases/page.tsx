"use client";

import { useState } from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Calendar01Icon,
  IdentificationIcon,
  ArrowRight01Icon,
  Logout01Icon,
  Shield01Icon,
  InformationCircleIcon,
  CheckmarkCircle02Icon,
  Clock01Icon,
} from "@hugeicons/core-free-icons";
import { personalSignOutAction } from "@/app/actions/personalAccess";
import { useRouter } from "next/navigation";
import { usePersonalIncidentsQuery } from "@/hooks/use-personal-access";
import { TablePagination } from "@/components/ui/table-pagination";

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
    month: "short",
    day: "numeric",
  }).format(d);
}

export default function PersonalIncidentsDashboardPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const { data, isLoading, isError, error } = usePersonalIncidentsQuery({
    page,
    pageSize,
  });

  const email = data?.verifiedEmail ?? "";
  const incidents = data?.incidents ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  const handleSignOut = async () => {
    await personalSignOutAction();
    router.push("/my-reports");
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const errorMessage = isError ? (error as Error)?.message : "";

  return (
    <main className="min-h-screen bg-gray-50/50 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* User Account Header */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-border mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 animate-slide-in-up">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shrink-0">
              <HugeiconsIcon icon={Shield01Icon} size={28} className="text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary px-3 py-1 rounded-full">
                  Verified Session
                </span>
              </div>
              <h1 className="text-xl md:text-2xl font-bold text-foreground font-serif">
                {email}
              </h1>
              <p className="text-sm text-muted-foreground">
                Showing all incident reports submitted from this email address.
              </p>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground font-bold text-sm rounded-xl transition-all self-start md:self-auto border border-border"
          >
            <HugeiconsIcon icon={Logout01Icon} size={18} />
            <span>Sign Out</span>
          </button>
        </div>

        {errorMessage ? (
          <div className="bg-white rounded-3xl p-8 border border-border shadow-sm text-center max-w-lg mx-auto">
            <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-200">
              <HugeiconsIcon icon={InformationCircleIcon} size={28} />
            </div>
            <h2 className="text-xl font-bold font-serif text-foreground mb-2">
              {errorMessage.includes("Unauthorized") ? "Session Expired" : "Unable to Load Reports"}
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              {errorMessage.includes("Unauthorized")
                ? "Your 1-hour verification session has expired. Please verify your email again to continue."
                : errorMessage}
            </p>
            <Link
              href="/my-reports"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-bold text-sm rounded-xl hover:bg-primary-light transition-all shadow-sm"
            >
              <span>Request New Verification Code</span>
              <HugeiconsIcon icon={ArrowRight01Icon} size={18} />
            </Link>
          </div>
        ) : incidents.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-border shadow-sm">
            <div className="w-16 h-16 bg-muted/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-muted-foreground">
              <HugeiconsIcon icon={InformationCircleIcon} size={32} />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2 font-serif">
              No Incident Reports Found
            </h2>
            <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">
              There are no incident reports associated with <span className="font-semibold">{email}</span>.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-bold text-sm rounded-xl hover:bg-primary-light transition-all shadow-sm"
            >
              <span>Submit New Incident</span>
              <HugeiconsIcon icon={ArrowRight01Icon} size={18} />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2 mb-2">
              <h2 className="text-lg font-bold text-foreground font-serif">
                Your Reports ({totalCount})
              </h2>
            </div>

            {incidents.map((incident) => {
              const statusBadge = getStatusBadge(incident.status);
              const StatusIcon = statusBadge.icon;

              return (
                <div
                  key={incident.id}
                  className="bg-white rounded-2xl p-6 border-2 border-border hover:border-primary/40 transition-all shadow-sm hover:shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6 group"
                >
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusBadge.classes}`}
                      >
                        <HugeiconsIcon icon={StatusIcon} size={14} />
                        {statusBadge.label}
                      </span>

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getSeverityBadge(
                          incident.severity
                        )}`}
                      >
                        {incident.severity}
                      </span>

                      <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full flex items-center gap-1">
                        <HugeiconsIcon icon={IdentificationIcon} size={14} />
                        {incident.ticketId || incident.thehiveCaseId || `ID: ${incident.id.slice(-8)}`}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
                      {incident.title || `Incident Report (${incident.type})`}
                    </h3>

                    <div className="flex items-center gap-6 text-xs text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1.5 font-medium">
                        <HugeiconsIcon icon={Calendar01Icon} size={14} />
                        Submitted: {formatDate(incident.submittedAt)}
                      </span>
                      {incident.hiveStatus && (
                        <span className="font-medium text-gray-600 bg-gray-100 px-2.5 py-0.5 rounded border border-gray-200">
                          Analyst Status: {incident.hiveStatus}
                        </span>
                      )}
                    </div>
                  </div>

                  <Link
                    href={`/my-reports/cases/${incident.id}`}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-muted/20 hover:bg-primary text-foreground hover:text-primary-foreground font-bold text-sm rounded-xl transition-all border border-border group-hover:border-primary shrink-0"
                  >
                    <span>View Details</span>
                    <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
                  </Link>
                </div>
              );
            })}

            {/* Shared Pagination Component */}
            <TablePagination
              page={page}
              totalPages={totalPages}
              totalCount={totalCount}
              onPageChange={setPage}
              itemLabel="reports"
            />
          </div>
        )}
      </div>
    </main>
  );
}
