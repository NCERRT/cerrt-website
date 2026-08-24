"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Building01Icon,
  CheckmarkCircle02Icon,
  Cancel01Icon,
  Clock01Icon,
  Alert02Icon,
  Mail01Icon,
  UserIcon,
  Search01Icon,
  Building02Icon,
} from "@hugeicons/core-free-icons";

import {
  useMdaRegistrationsQuery,
  useApproveMdaRegistration,
  useRejectMdaRegistration,
} from "@/hooks/use-mda-registrations";
import { TablePagination } from "@/components/ui/table-pagination";

export default function MdaRegistrationsAdminPage() {
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<"pending" | "approved" | "rejected" | "ALL">("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
  const pageSize = 15;

  // Approval Modal State
  const [approvingTarget, setApprovingTarget] = useState<{ id: string; name: string } | null>(null);

  // Rejection Modal State
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const { data, isLoading, isError, error } = useMdaRegistrationsQuery({
    page,
    pageSize,
    search: searchQuery,
    statusFilter: activeTab,
  });

  const approveMutation = useApproveMdaRegistration();
  const rejectMutation = useRejectMdaRegistration();

  const registrations = data?.registrations ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  const handleTabChange = (tab: "pending" | "approved" | "rejected" | "ALL") => {
    setActiveTab(tab);
    setPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setPage(1);
  };

  const handleConfirmApprove = () => {
    if (!approvingTarget) return;

    setActionError("");
    setActionSuccess("");

    approveMutation.mutate(approvingTarget.id, {
      onSuccess: (res) => {
        if (res.success) {
          setActionSuccess(res.message || "Registration approved successfully.");
          setApprovingTarget(null);
        } else {
          setActionError(res.error);
        }
      },
      onError: (err) => {
        setActionError((err as Error).message || "Failed to approve registration.");
      },
    });
  };

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingId) return;

    if (rejectReason.trim().length < 5) {
      setActionError("Please provide a rejection reason of at least 5 characters.");
      return;
    }

    setActionError("");
    setActionSuccess("");

    rejectMutation.mutate(
      { registrationId: rejectingId, reason: rejectReason },
      {
        onSuccess: (res) => {
          if (res.success) {
            setActionSuccess(res.message || "Registration rejected.");
            setRejectingId(null);
            setRejectReason("");
          } else {
            setActionError(res.error);
          }
        },
        onError: (err) => {
          setActionError((err as Error).message || "Failed to reject registration.");
        },
      },
    );
  };

  const statusCards = [
    {
      label: "Pending Review",
      tab: "pending" as const,
      icon: Clock01Icon,
      iconColor: "text-amber-600 bg-amber-50 border border-amber-200/80",
    },
    {
      label: "Approved",
      tab: "approved" as const,
      icon: CheckmarkCircle02Icon,
      iconColor: "text-primary bg-primary/10 border border-primary/20",
    },
    {
      label: "Rejected",
      tab: "rejected" as const,
      icon: Cancel01Icon,
      iconColor: "text-red-600 bg-red-50 border border-red-200/80",
    },
    {
      label: "All Applications",
      tab: "ALL" as const,
      icon: Building02Icon,
      iconColor: "text-slate-700 bg-slate-100 border border-slate-200",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            MDA Self-Registrations
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Review and approve registration applications submitted by Ministries, Departments, & Agencies.
          </p>
        </div>
      </div>

      {/* Action Messages */}
      {(actionError || isError) && (
        <div className="bg-red-50 border border-red-200/80 rounded-2xl p-4 flex items-center justify-between text-red-700 text-sm">
          <div className="flex items-center space-x-2">
            <HugeiconsIcon icon={Alert02Icon} size={18} className="text-red-600" />
            <span>{actionError || (error as Error)?.message}</span>
          </div>
          <button onClick={() => setActionError("")} className="text-red-400 hover:text-red-600">
            <HugeiconsIcon icon={Cancel01Icon} size={16} />
          </button>
        </div>
      )}

      {actionSuccess && (
        <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex items-center justify-between text-primary text-sm">
          <div className="flex items-center space-x-2">
            <HugeiconsIcon icon={CheckmarkCircle02Icon} size={18} className="text-primary" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess("")} className="text-primary hover:opacity-75">
            <HugeiconsIcon icon={Cancel01Icon} size={16} />
          </button>
        </div>
      )}

      {/* Status Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {statusCards.map((card) => {
          const Icon = card.icon;
          const isSelected = activeTab === card.tab;

          return (
            <button
              key={card.tab}
              onClick={() => handleTabChange(card.tab)}
              className={`p-4 rounded-2xl text-left transition-all cursor-pointer bg-white border ${
                isSelected
                  ? "border-2 border-slate-900 ring-2 ring-slate-900/5 bg-slate-50/50 shadow-sm"
                  : "border-slate-200 hover:border-slate-300 shadow-xs"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${card.iconColor}`}>
                  <HugeiconsIcon icon={Icon} size={18} />
                </div>
              </div>
              <div className="text-xs font-semibold text-slate-700">
                {card.label}
              </div>
            </button>
          );
        })}
      </div>

      {/* Search Bar */}
      <div className="flex justify-end">
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <HugeiconsIcon icon={Search01Icon} size={16} />
          </div>
          <input
            type="text"
            placeholder="Search by agency, contact, or domain..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 shadow-xs"
          />
        </div>
      </div>

      {/* Registrations Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            <div className="w-6 h-6 border-2 border-slate-800 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Loading MDA registrations...
          </div>
        ) : registrations.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            <HugeiconsIcon icon={Building01Icon} size={32} className="mx-auto mb-3 text-slate-400" />
            No MDA registrations found matching criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/80 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Organization
                  </th>
                  <th className="px-6 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Contact Officer
                  </th>
                  <th className="px-6 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Domain Status
                  </th>
                  <th className="px-6 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Submitted Date
                  </th>
                  <th className="px-6 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {registrations.map((r) => {
                  const isOfficialDomain =
                    r.emailDomain.endsWith(".gov.ng") ||
                    r.emailDomain.endsWith(".mil.ng") ||
                    r.emailDomain.endsWith(".edu.ng");

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Organization Info */}
                      <td className="px-6 py-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                            {r.acronym ? r.acronym.slice(0, 3) : r.organizationName.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-sm leading-snug">
                              {r.organizationName}
                              {r.acronym && (
                                <span className="ml-1.5 text-xs font-medium text-slate-500">
                                  ({r.acronym})
                                </span>
                              )}
                            </div>
                            {r.sector && (
                              <span className="text-[11px] text-primary font-medium block mt-0.5">
                                {r.sector}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Contact Officer */}
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900 flex items-center space-x-1.5">
                          <HugeiconsIcon icon={UserIcon} size={14} className="text-slate-400" />
                          <span>{r.contactName}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 flex items-center space-x-1">
                          <HugeiconsIcon icon={Mail01Icon} size={12} className="text-slate-400" />
                          <span>{r.contactEmail}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 block">{r.jobTitle}</span>
                      </td>

                      {/* Domain Badge */}
                      <td className="px-6 py-4">
                        <span className="font-mono text-slate-800 font-semibold block text-xs">
                          @{r.emailDomain}
                        </span>
                        {isOfficialDomain ? (
                          <Badge variant="outline" className="mt-1 bg-primary/10 text-primary border-primary/20 text-[10px] py-0.5 font-semibold">
                            Verified Official TLD
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="mt-1 bg-amber-50 text-amber-700 border-amber-200 text-[10px] py-0.5 font-semibold">
                            Non-Standard Domain
                          </Badge>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        {r.status === "pending" && (
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 font-bold">
                            Pending Review
                          </Badge>
                        )}
                        {r.status === "approved" && (
                          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-bold">
                            Approved
                          </Badge>
                        )}
                        {r.status === "rejected" && (
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 font-bold">
                            Rejected
                          </Badge>
                        )}
                        {r.reviewNote && (
                          <p className="text-[11px] text-red-600 mt-1 max-w-xs truncate" title={r.reviewNote}>
                            Reason: {r.reviewNote}
                          </p>
                        )}
                      </td>

                      {/* Submitted Date */}
                      <td className="px-6 py-4 text-slate-500 font-medium">
                        {new Date(r.createdAt).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right space-x-2">
                        {r.status === "pending" ? (
                          <>
                            <Button
                              size="sm"
                              disabled={approveMutation.isPending || rejectMutation.isPending}
                              onClick={() => setApprovingTarget({ id: r.id, name: r.organizationName })}
                              className="bg-primary hover:bg-primary-light text-primary-foreground text-xs font-semibold h-8 rounded-lg"
                            >
                              <HugeiconsIcon icon={CheckmarkCircle02Icon} size={14} className="mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              disabled={approveMutation.isPending || rejectMutation.isPending}
                              onClick={() => {
                                setRejectingId(r.id);
                                setRejectReason("");
                              }}
                              className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold h-8 rounded-lg"
                            >
                              Reject
                            </Button>
                          </>
                        ) : (
                          <span className="text-xs font-medium text-slate-400">Processed</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Shared Pagination Component */}
        <TablePagination
          page={page}
          totalPages={totalPages}
          totalCount={totalCount}
          onPageChange={setPage}
          itemLabel="applications"
        />
      </div>

      {/* Approval Confirmation Modal */}
      {approvingTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
              <HugeiconsIcon icon={CheckmarkCircle02Icon} size={20} className="text-primary" />
              Approve MDA Registration
            </h3>
            <p className="text-slate-600 text-xs leading-relaxed mb-6">
              Are you sure you want to approve the registration application for{" "}
              <strong className="text-slate-900">{approvingTarget.name}</strong>? This will create an active MDA Organization and a 1:1 login account.
            </p>

            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setApprovingTarget(null)}
                disabled={approveMutation.isPending}
                className="text-xs rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={approveMutation.isPending}
                onClick={handleConfirmApprove}
                className="text-xs bg-primary hover:bg-primary-light text-primary-foreground font-semibold rounded-xl"
              >
                {approveMutation.isPending ? "Approving..." : "Confirm Approval"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {rejectingId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
              <HugeiconsIcon icon={Cancel01Icon} size={20} className="text-red-600" />
              Reject MDA Application
            </h3>
            <p className="text-slate-600 text-xs mb-4">
              Please specify the reason for rejection. This explanation will be included in the email sent to the applicant.
            </p>

            <form onSubmit={handleConfirmReject} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Rejection Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Official domain verification failed. Please contact CERRT support with authorization letter."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setRejectingId(null)}
                  disabled={rejectMutation.isPending}
                  className="text-xs rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="destructive"
                  disabled={rejectMutation.isPending || rejectReason.trim().length < 5}
                  className="text-xs bg-red-600 hover:bg-red-700 font-semibold rounded-xl"
                >
                  {rejectMutation.isPending ? "Rejecting..." : "Confirm Rejection"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
