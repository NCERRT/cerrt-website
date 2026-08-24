"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Alert02Icon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  Search01Icon,
} from "@hugeicons/core-free-icons";
import type { IncidentStatus, SubmissionChannel } from "@prisma/client";
import { useReportsQuery, useIncidentStatsQuery } from "@/hooks/use-reports";
import { TablePagination } from "@/components/ui/table-pagination";

export default function ReportsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<IncidentStatus | undefined>(undefined);
  const [channelFilter, setChannelFilter] = useState<SubmissionChannel | undefined>(undefined);
  const pageSize = 15;

  const { data: stats } = useIncidentStatsQuery();
  const { data: reportsData, isLoading, isError, error } = useReportsQuery({
    page,
    pageSize,
    search,
    status: statusFilter,
    channel: channelFilter,
  });

  const reports = reportsData?.reports ?? [];
  const totalCount = reportsData?.totalCount ?? 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  const handleStatusChange = (val: IncidentStatus | undefined) => {
    setStatusFilter(val);
    setPage(1);
  };

  const handleChannelChange = (val: SubmissionChannel | undefined) => {
    setChannelFilter(val);
    setPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const statusCounts = [
    {
      label: "All Statuses",
      value: undefined,
      count: stats?.total || 0,
      icon: Alert02Icon,
      iconColor: "text-slate-700 bg-slate-100 border border-slate-200",
    },
    {
      label: "New",
      value: "new" as IncidentStatus,
      count: stats?.new || 0,
      icon: Alert02Icon,
      iconColor: "text-red-600 bg-red-50 border border-red-200/80",
    },
    {
      label: "Reviewing",
      value: "reviewing" as IncidentStatus,
      count: stats?.reviewing || 0,
      icon: Clock01Icon,
      iconColor: "text-amber-600 bg-amber-50 border border-amber-200/80",
    },
    {
      label: "Resolved",
      value: "resolved" as IncidentStatus,
      count: stats?.resolved || 0,
      icon: CheckmarkCircle02Icon,
      iconColor: "text-emerald-600 bg-emerald-50 border border-emerald-200/80",
    },
    {
      label: "Closed",
      value: "closed" as IncidentStatus,
      count: stats?.closed || 0,
      icon: CheckmarkCircle02Icon,
      iconColor: "text-slate-500 bg-slate-50 border border-slate-200",
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
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
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
        <div className="flex items-center gap-1.5 bg-gray-100 p-1.5 rounded-xl self-start md:self-auto border border-gray-200">
          {channelOptions.map((opt) => (
            <button
              key={opt.label}
              onClick={() => handleChannelChange(opt.value)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
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
              onClick={() => handleStatusChange(filter.value)}
              className={`p-4 rounded-2xl text-left transition-all cursor-pointer bg-white border ${
                isSelected
                  ? "border-2 border-slate-900 ring-2 ring-slate-900/5 bg-slate-50/50 shadow-sm"
                  : "border-slate-200 hover:border-slate-300 shadow-xs"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center ${filter.iconColor}`}
                >
                  <HugeiconsIcon icon={Icon} size={16} />
                </div>
                <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  {filter.count}
                </span>
              </div>
              <div className="text-xs font-semibold text-slate-700">
                {filter.label}
              </div>
            </button>
          );
        })}
      </div>

      {/* Search Input */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="relative max-w-md">
          <Input
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search report title, description, reporter, or SOC ID..."
            className="pl-10 text-xs"
          />
          <div className="absolute left-3 top-3 text-gray-400">
            <HugeiconsIcon icon={Search01Icon} size={16} />
          </div>
        </div>
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
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500 text-sm">
                    Loading incident reports...
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-red-600 text-sm">
                    {(error as Error)?.message || "Failed to load incident reports."}
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500 text-sm">
                    No reports found matching criteria.
                  </td>
                </tr>
              ) : (
                reports.map((report) => (
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
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Shared Pagination Component */}
        <TablePagination
          page={page}
          totalPages={totalPages}
          totalCount={totalCount}
          onPageChange={setPage}
          itemLabel="reports"
        />
      </div>
    </div>
  );
}
