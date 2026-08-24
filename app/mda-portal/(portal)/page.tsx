"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Building02Icon,
  Alert02Icon,
  Clock01Icon,
  CheckmarkCircle02Icon,
  Add01Icon,
  ArrowRight01Icon,
  Shield01Icon,
  Mail01Icon,
  UserIcon,
} from "@hugeicons/core-free-icons";

import { getMdaSessionAction } from "@/app/actions/mdaAuth";
import { getMdaDashboardStatsAction } from "@/app/actions/mdaPortal";
import type { AuthenticatedMdaUser } from "@/lib/server/mdaAuth";

interface IncidentItem {
  id: string;
  title: string | null;
  type: string;
  severity: string;
  status: string;
  submittedAt: string | Date;
  thehiveCaseId: string | null;
}

export default function MdaDashboardPage() {
  const [user, setUser] = useState<AuthenticatedMdaUser | null>(null);
  const [stats, setStats] = useState<{
    total: number;
    newCount: number;
    reviewingCount: number;
    resolvedCount: number;
    recentIncidents: IncidentItem[];
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getMdaSessionAction(), getMdaDashboardStatsAction()])
      .then(([session, statsRes]) => {
        if (session) setUser(session);
        if (statsRes.success && statsRes.data) {
          setStats(statsRes.data as unknown as typeof stats);
        } else if (!statsRes.success) {
          setError(statsRes.error);
        }
      })
      .catch(() => setError("Failed to load dashboard data."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
              <HugeiconsIcon icon={Shield01Icon} size={14} />
              <span>Verified MDA Organization</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Welcome, {user?.organizationName || "MDA Partner"}
            </h1>
            <p className="text-sm text-gray-600 max-w-xl">
              Official portal gateway for incident tracking, emergency response coordination, and two-way SOC communications with CERRT.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 shrink-0">
            <Link
              href="/mda-portal/report"
              className="inline-flex items-center px-4 py-2.5 rounded-xl text-xs font-bold bg-primary hover:bg-primary-light text-primary-foreground shadow-xs transition-all"
            >
              <HugeiconsIcon icon={Add01Icon} size={16} className="mr-1.5" />
              Report New Incident
            </Link>
            <Link
              href="/mda-portal/cases"
              className="inline-flex items-center px-4 py-2.5 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-800 transition-all border border-gray-200"
            >
              View All Cases
              <HugeiconsIcon icon={ArrowRight01Icon} size={14} className="ml-1.5" />
            </Link>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700 text-sm font-medium">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center">
              <HugeiconsIcon icon={Alert02Icon} size={20} />
            </div>
            <span className="text-3xl font-extrabold text-gray-900 tracking-tight">
              {stats?.total ?? 0}
            </span>
          </div>
          <div className="text-xs font-bold text-gray-600">Total Reported Incidents</div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 border border-amber-200/80 flex items-center justify-center">
              <HugeiconsIcon icon={Clock01Icon} size={20} />
            </div>
            <span className="text-3xl font-extrabold text-amber-700 tracking-tight">
              {stats?.newCount ?? 0}
            </span>
          </div>
          <div className="text-xs font-bold text-gray-600">New Submissions</div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 border border-purple-200/80 flex items-center justify-center">
              <HugeiconsIcon icon={Clock01Icon} size={20} />
            </div>
            <span className="text-3xl font-extrabold text-purple-700 tracking-tight">
              {stats?.reviewingCount ?? 0}
            </span>
          </div>
          <div className="text-xs font-bold text-gray-600">Under Analyst Review</div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center">
              <HugeiconsIcon icon={CheckmarkCircle02Icon} size={20} />
            </div>
            <span className="text-3xl font-extrabold text-primary tracking-tight">
              {stats?.resolvedCount ?? 0}
            </span>
          </div>
          <div className="text-xs font-bold text-gray-600">Resolved Cases</div>
        </div>
      </div>

      {/* Organization Overview & Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Organization Overview Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5 shadow-xs h-fit">
          <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
            <HugeiconsIcon icon={Building02Icon} size={18} className="text-primary" />
            Agency Profile
          </h2>

          <div className="space-y-4 text-xs">
            <div>
              <span className="text-gray-500 block mb-1">Organization Name:</span>
              <span className="text-gray-900 font-bold text-sm">{user?.organizationName}</span>
            </div>

            <div>
              <span className="text-gray-500 block mb-1">Sector:</span>
              <span className="text-primary font-semibold">{user?.sector || "Public Sector"}</span>
            </div>

            <div>
              <span className="text-gray-500 block mb-1">Verified Domain:</span>
              <span className="font-mono text-gray-900 font-bold bg-gray-100 px-2.5 py-1 rounded-md border border-gray-200 inline-block">
                @{user?.verifiedDomains[0] || "gov.ng"}
              </span>
            </div>

            <div className="pt-3 border-t border-gray-100">
              <span className="text-gray-500 block mb-1">Designated Officer:</span>
              <div className="font-bold text-gray-900 flex items-center space-x-1.5">
                <HugeiconsIcon icon={UserIcon} size={14} className="text-gray-400" />
                <span>{user?.contactName}</span>
              </div>
              <div className="text-gray-600 mt-1 flex items-center space-x-1">
                <HugeiconsIcon icon={Mail01Icon} size={12} className="text-gray-400" />
                <span>{user?.email}</span>
              </div>
              <span className="text-[11px] text-gray-500 block mt-0.5">{user?.jobTitle}</span>
            </div>
          </div>

          <div className="pt-2">
            <Link
              href="/mda-portal/settings"
              className="w-full inline-flex justify-center items-center py-2.5 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-800 transition-all border border-gray-200"
            >
              Manage Account Settings
            </Link>
          </div>
        </div>

        {/* Right: Recent Incident Activity Table */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <HugeiconsIcon icon={Alert02Icon} size={18} className="text-primary" />
              Recent Incidents
            </h2>
            <Link
              href="/mda-portal/cases"
              className="text-xs font-semibold text-primary hover:text-primary-light flex items-center gap-1"
            >
              <span>View All ({stats?.total ?? 0})</span>
              <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-500 text-xs">
              Loading recent incidents...
            </div>
          ) : !stats?.recentIncidents || stats.recentIncidents.length === 0 ? (
            <div className="p-12 text-center text-gray-500 text-xs border border-dashed border-gray-200 rounded-2xl">
              <HugeiconsIcon icon={Alert02Icon} size={28} className="mx-auto mb-2 text-gray-400" />
              No incidents reported yet for {user?.organizationName}.
              <div className="mt-4">
                <Link
                  href="/mda-portal/report"
                  className="inline-flex items-center px-3.5 py-2 rounded-xl text-xs font-bold bg-primary hover:bg-primary-light text-primary-foreground"
                >
                  <HugeiconsIcon icon={Add01Icon} size={14} className="mr-1" />
                  Report Your First Incident
                </Link>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-gray-50 text-gray-600 font-bold uppercase text-[10px] tracking-wider border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3">Incident Title / Type</th>
                    <th className="px-4 py-3">Severity</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">SOC Ref ID</th>
                    <th className="px-4 py-3 text-right">Submitted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-800">
                  {stats.recentIncidents.map((incident) => (
                    <tr key={incident.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-4 py-3.5 font-bold text-gray-900 max-w-xs truncate">
                        <Link href={`/mda-portal/cases/${incident.id}`} className="hover:text-primary">
                          {incident.title || incident.type}
                        </Link>
                      </td>
                      <td className="px-4 py-3.5 capitalize font-medium text-gray-600">
                        {incident.severity}
                      </td>
                      <td className="px-4 py-3.5 capitalize font-bold">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] ${
                            incident.status === "new"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : incident.status === "reviewing"
                              ? "bg-purple-50 text-purple-700 border border-purple-200"
                              : "bg-primary/10 text-primary border border-primary/20"
                          }`}
                        >
                          {incident.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs text-gray-600 font-semibold">
                        {incident.thehiveCaseId ? (
                          <span className="text-purple-700 font-bold">{incident.thehiveCaseId}</span>
                        ) : (
                          <span className="text-gray-400 font-normal">Pending Sync</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right text-gray-500 font-medium">
                        {new Date(incident.submittedAt).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
