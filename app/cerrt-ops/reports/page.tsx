"use client";

"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Alert02Icon,
  CheckmarkCircle02Icon,
  Clock01Icon,
} from "@hugeicons/core-free-icons";
import type {
  IncidentReport,
  IncidentStatus,
  SubmissionChannel,
} from "@prisma/client";
import {
  getIncidentReportsAction,
  getIncidentStatsAction,
} from "@/app/actions/incidentReports";

export default function ReportsPage() {
  const [statusFilter, setStatusFilter] = useState<IncidentStatus | undefined>(
    undefined,
  );
  const [channelFilter, setChannelFilter] = useState<
    SubmissionChannel | undefined
  >(undefined);
  const [reports, setReports] = useState<IncidentReport[] | null>(null);
  const [stats, setStats] = useState<{
    total: number;
    new: number;
    reviewing: number;
    resolved: number;
    closed: number;
  } | null>(null);

  const loadData = useCallback(() => {
    getIncidentReportsAction(statusFilter, channelFilter)
      .then(setReports)
      .catch(() => setReports([]));
    getIncidentStatsAction()
      .then(setStats)
      .catch(() => {});
  }, [statusFilter, channelFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const statusCounts = [
    {
      label: "All Statuses",
      value: undefined,
      count: stats?.total || 0,
      icon: Alert02Icon,
      bgClass: "bg-gray-50 text-gray-600 border border-gray-200",
      activeBgClass: "bg-gray-600 text-white",
    },
    {
      label: "New",
      value: "new",
      count: stats?.new || 0,
      icon: Alert02Icon,
      bgClass: "bg-red-50 text-red-600 border border-red-100",
      activeBgClass: "bg-red-600 text-white",
    },
    {
      label: "Reviewing",
      value: "reviewing",
      count: stats?.reviewing || 0,
      icon: Clock01Icon,
      bgClass: "bg-amber-50 text-amber-600 border border-amber-100",
      activeBgClass: "bg-amber-600 text-white",
    },
    {
      label: "Resolved",
      value: "resolved",
      count: stats?.resolved || 0,
      icon: CheckmarkCircle02Icon,
      bgClass: "bg-green-50 text-green-600 border border-green-100",
      activeBgClass: "bg-green-600 text-white",
    },
    {
      label: "Closed",
      value: "closed",
      count: stats?.closed || 0,
      icon: CheckmarkCircle02Icon,
      bgClass: "bg-gray-50 text-gray-500 border border-gray-200",
      activeBgClass: "bg-gray-500 text-white",
    },
  ];

  const channelOptions: {
    label: string;
    value: SubmissionChannel | undefined;
  }[] = [
    { label: "All Channels", value: undefined },
    { label: "Web Form", value: "web" },
    { label: "Email Box", value: "email" },
    { label: "API Sync", value: "api" },
  ];

  function getChannelBadge(channel: SubmissionChannel) {
    switch (channel) {
      case "email":
        return (
          <Badge
            variant="outline"
            className="bg-purple-50 text-purple-700 border-purple-200"
          >
            Email
          </Badge>
        );
      case "api":
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200"
          >
            API
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="bg-emerald-50 text-emerald-700 border-emerald-200"
          >
            Web
          </Badge>
        );
    }
  }

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-serif">
            Incident Reports
          </h1>
          <p className="text-gray-600 mt-2">
            Review and respond to incident reports submitted via website forms,
            email, or API sync
          </p>
        </div>

        {/* Channel Filter Selector */}
        <div className="flex items-center gap-1.5 bg-gray-100 p-1.5 rounded-xl self-start border border-gray-200">
          {channelOptions.map((opt) => (
            <button
              key={opt.label}
              onClick={() => setChannelFilter(opt.value)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                channelFilter === opt.value
                  ? "bg-white text-gray-900 shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        {statusCounts.map((filter) => {
          const Icon = filter.icon;
          const isSelected = statusFilter === filter.value;
          return (
            <button
              key={filter.label}
              onClick={() => setStatusFilter(filter.value as IncidentStatus)}
              className={`p-4 rounded-[14px] transition-all text-left group cursor-pointer ${
                isSelected
                  ? filter.activeBgClass
                  : "bg-white hover:bg-gray-50 border border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isSelected ? "bg-white/20 text-white" : filter.bgClass
                  }`}
                >
                  <HugeiconsIcon icon={Icon} size={16} />
                </div>
                <span
                  className={`text-xl font-bold ${
                    isSelected ? "text-white" : "text-gray-900"
                  }`}
                >
                  {filter.count}
                </span>
              </div>
              <div
                className={`text-sm font-semibold ${
                  isSelected ? "text-white" : "text-gray-900"
                }`}
              >
                {filter.label}
              </div>
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">
                  Subject / Title
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">
                  Channel
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">
                  Category
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">
                  Reporter
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">
                  Severity
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">
                  Submitted
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {reports?.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <Link
                      href={`/cerrt-ops/reports/${report.id}`}
                      className="text-sm font-semibold text-gray-900 hover:text-primary transition-colors block max-w-xs truncate"
                    >
                      {report.title || `Incident #${report.id.slice(-6)}`}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    {getChannelBadge(report.submissionChannel)}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-gray-700">
                      {report.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 font-medium">
                      {report.contactName || "Anonymous"}
                    </div>
                    {report.contactEmail && (
                      <div className="text-xs text-gray-500">
                        {report.contactEmail}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {report.severity ? (
                      <Badge
                        variant={
                          report.severity === "critical"
                            ? "destructive"
                            : "default"
                        }
                      >
                        {report.severity}
                      </Badge>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      variant={
                        report.status === "new"
                          ? "destructive"
                          : report.status === "resolved"
                            ? "default"
                            : "outline"
                      }
                    >
                      {report.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(report.submittedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/cerrt-ops/reports/${report.id}`}>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {reports?.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No reports found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
