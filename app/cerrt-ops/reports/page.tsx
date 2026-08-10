"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { HugeiconsIcon } from "@hugeicons/react";
import { Alert02Icon, CheckmarkCircle02Icon, Clock01Icon } from "@hugeicons/core-free-icons";
import type { IncidentReport, IncidentStatus } from "@prisma/client";
import {
  getIncidentReportsAction,
  getIncidentStatsAction,
} from "@/app/actions/incidentReports";
import { ReportDetails } from "@/components/admin/report-details";

export default function ReportsPage() {
  const [statusFilter, setStatusFilter] = useState<IncidentStatus | undefined>(
    undefined,
  );
  const [reports, setReports] = useState<IncidentReport[] | null>(null);
  const [stats, setStats] = useState<{
    total: number;
    new: number;
    reviewing: number;
    resolved: number;
    closed: number;
  } | null>(null);
  const [selectedReport, setSelectedReport] = useState<IncidentReport | null>(
    null,
  );

  const loadData = useCallback(() => {
    getIncidentReportsAction(statusFilter)
      .then(setReports)
      .catch(() => setReports([]));
    getIncidentStatsAction()
      .then(setStats)
      .catch(() => {});
  }, [statusFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const statusCounts = [
    {
      label: "All",
      value: undefined,
      count: stats?.total || 0,
      icon: Alert02Icon,
      bgClass: "bg-gray-50 text-gray-600 border border-gray-200",
      hoverBgClass: "group-hover:bg-gray-600 group-hover:text-white",
      activeBgClass: "bg-gray-600 text-white",
    },
    {
      label: "New",
      value: "new",
      count: stats?.new || 0,
      icon: Alert02Icon,
      bgClass: "bg-red-50 text-red-600 border border-red-100",
      hoverBgClass: "group-hover:bg-red-600 group-hover:text-white",
      activeBgClass: "bg-red-600 text-white",
    },
    {
      label: "Reviewing",
      value: "reviewing",
      count: stats?.reviewing || 0,
      icon: Clock01Icon,
      bgClass: "bg-amber-50 text-amber-600 border border-amber-100",
      hoverBgClass: "group-hover:bg-amber-600 group-hover:text-white",
      activeBgClass: "bg-amber-600 text-white",
    },
    {
      label: "Resolved",
      value: "resolved",
      count: stats?.resolved || 0,
      icon: CheckmarkCircle02Icon,
      bgClass: "bg-green-50 text-green-600 border border-green-100",
      hoverBgClass: "group-hover:bg-green-600 group-hover:text-white",
      activeBgClass: "bg-green-600 text-white",
    },
    {
      label: "Closed",
      value: "closed",
      count: stats?.closed || 0,
      icon: CheckmarkCircle02Icon,
      bgClass: "bg-gray-50 text-gray-500 border border-gray-200",
      hoverBgClass: "group-hover:bg-gray-500 group-hover:text-white",
      activeBgClass: "bg-gray-500 text-white",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 font-serif">
          Incident Reports
        </h1>
        <p className="text-gray-600 mt-2">
          Review and manage incident reports from users
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {statusCounts.map((stat) => {
          const isActive = statusFilter === stat.value;
          return (
            <button
              key={stat.label}
              onClick={() => setStatusFilter(stat.value as "new" | "reviewing" | "resolved" | "closed" | undefined)}
              className={`bg-white rounded-xl border-2 p-6 text-left hover:shadow-lg transition-all duration-200 group hover:-translate-y-0.5 cursor-pointer ${
                isActive
                  ? "border-primary"
                  : "border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 ${
                    isActive
                      ? stat.activeBgClass
                      : `${stat.bgClass} ${stat.hoverBgClass}`
                  }`}
                >
                  <HugeiconsIcon
                    icon={stat.icon}
                    size={20}
                    color="currentColor"
                  />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1 group-hover:text-primary transition-colors duration-200">
                {stat.count}
              </div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </button>
          );
        })}
      </div>

      {/* Reports List */}
      <div className="bg-white rounded-xl border-2 border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">
                  Contact
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
                    <span className="text-sm font-medium text-gray-900">
                      {report.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {report.contactName || "Anonymous"}
                    </div>
                    {report.contactEmail && (
                      <div className="text-xs text-gray-600">
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedReport(report)}
                    >
                      View Details
                    </Button>
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

      {/* Report Details Dialog */}
      {selectedReport && (
        <Dialog
          open={!!selectedReport}
          onOpenChange={() => setSelectedReport(null)}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Incident Report Details</DialogTitle>
            </DialogHeader>
            <ReportDetails
              report={selectedReport}
              onClose={() => setSelectedReport(null)}
              onSaved={loadData}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}


