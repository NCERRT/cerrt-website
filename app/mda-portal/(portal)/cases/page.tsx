"use client";

import { useState } from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Alert02Icon,
  Search01Icon,
  Clock01Icon,
  CheckmarkCircle02Icon,
  Add01Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";

import { useMdaIncidentsQuery } from "@/hooks/use-mda-incidents";
import { TablePagination } from "@/components/ui/table-pagination";

export default function MdaCasesPage() {
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<"ALL" | "new" | "reviewing" | "resolved">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const pageSize = 15;

  const { data, isLoading, isError, error } = useMdaIncidentsQuery({
    page,
    pageSize,
    search: searchQuery,
    status: activeTab,
  });

  const incidents = data?.incidents ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  const handleTabChange = (tab: "ALL" | "new" | "reviewing" | "resolved") => {
    setActiveTab(tab);
    setPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setPage(1);
  };

  const statusCards = [
    {
      label: "All Incidents",
      tab: "ALL" as const,
      icon: Alert02Icon,
      iconColor: "text-slate-700 bg-slate-100 border border-slate-200",
    },
    {
      label: "New",
      tab: "new" as const,
      icon: Clock01Icon,
      iconColor: "text-amber-600 bg-amber-50 border border-amber-200/80",
    },
    {
      label: "Reviewing",
      tab: "reviewing" as const,
      icon: Clock01Icon,
      iconColor: "text-purple-600 bg-purple-50 border border-purple-200/80",
    },
    {
      label: "Resolved",
      tab: "resolved" as const,
      icon: CheckmarkCircle02Icon,
      iconColor: "text-primary bg-primary/10 border border-primary/20",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <HugeiconsIcon icon={Alert02Icon} size={24} className="text-primary" />
            Agency Incident Cases
          </h1>
          <p className="text-xs text-gray-600 mt-1">
            Track active security incidents, SOC investigation progress, and two-way communication threads.
          </p>
        </div>

        <Link
          href="/mda-portal/report"
          className="inline-flex items-center px-4 py-2.5 rounded-xl text-xs font-bold bg-primary hover:bg-primary-light text-primary-foreground shadow-xs transition-all shrink-0 self-start sm:self-auto"
        >
          <HugeiconsIcon icon={Add01Icon} size={16} className="mr-1.5" />
          Report Incident
        </Link>
      </div>

      {isError && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700 text-sm font-medium">
          {(error as Error)?.message || "Failed to load incident cases."}
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
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
            <HugeiconsIcon icon={Search01Icon} size={16} />
          </div>
          <input
            type="text"
            placeholder="Search cases by title, type, or SOC ID..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full bg-white border border-gray-300 rounded-xl pl-10 pr-4 py-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 shadow-xs"
          />
        </div>
      </div>

      {/* Incidents Table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="p-12 text-center text-gray-500 text-xs">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Loading agency incidents...
          </div>
        ) : incidents.length === 0 ? (
          <div className="p-12 text-center text-gray-500 text-xs">
            <HugeiconsIcon icon={Alert02Icon} size={32} className="mx-auto mb-3 text-gray-400" />
            No incident cases found matching criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Incident Title & Description</th>
                  <th className="px-6 py-3.5">Severity</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">SOC Ref ID</th>
                  <th className="px-6 py-3.5">Submitted Date</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-800">
                {incidents.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4 max-w-sm">
                      <div className="font-bold text-gray-900 text-sm">
                        <Link href={`/mda-portal/cases/${item.id}`} className="hover:text-primary">
                          {item.title || item.type}
                        </Link>
                      </div>
                      <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">
                        {item.description}
                      </p>
                    </td>

                    <td className="px-6 py-4 capitalize font-semibold">
                      <span
                        className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold ${
                          item.severity === "critical" || item.severity === "high"
                            ? "bg-red-50 text-red-700 border border-red-200"
                            : "bg-gray-100 text-gray-700 border border-gray-200"
                        }`}
                      >
                        {item.severity}
                      </span>
                    </td>

                    <td className="px-6 py-4 capitalize font-bold">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] ${
                          item.status === "new"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : item.status === "reviewing"
                            ? "bg-purple-50 text-purple-700 border border-purple-200"
                            : "bg-primary/10 text-primary border border-primary/20"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 font-mono text-xs text-gray-600 font-semibold">
                      {item.thehiveCaseId ? (
                        <span className="text-purple-700 font-bold">{item.thehiveCaseId}</span>
                      ) : (
                        <span className="text-gray-400 font-normal">Pending Sync</span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-gray-500 font-medium">
                      {new Date(item.submittedAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/mda-portal/cases/${item.id}`}
                        className="inline-flex items-center text-xs font-semibold text-primary hover:text-primary-light bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-lg border border-primary/20 transition-all"
                      >
                        <span>View Details</span>
                        <HugeiconsIcon icon={ArrowRight01Icon} size={14} className="ml-1" />
                      </Link>
                    </td>
                  </tr>
                ))}
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
          itemLabel="cases"
        />
      </div>
    </div>
  );
}
