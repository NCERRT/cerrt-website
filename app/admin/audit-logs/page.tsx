"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/useAuth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Task01Icon,
  Search01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import { getAuditLogsAction, type AuditLogItem } from "@/app/actions/audit";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AuditLogsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [logs, setLogs] = useState<AuditLogItem[] | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [actionType, setActionType] = useState("ALL");
  const [loadingData, setLoadingData] = useState(false);

  const pageSize = 15;

  // Superadmin-only page. Redirect regular admins away.
  useEffect(() => {
    if (!isLoading && user && user.role !== "superadmin") {
      router.push("/admin");
    }
  }, [user, isLoading, router]);

  const loadData = useCallback(() => {
    setLoadingData(true);
    getAuditLogsAction({
      page,
      pageSize,
      search,
      actionType,
    })
      .then((res) => {
        setLogs(res.logs);
        setTotalCount(res.totalCount);
      })
      .catch((err) => {
        setLogs([]);
        toast.error((err as Error).message || "Failed to load audit logs");
      })
      .finally(() => {
        setLoadingData(false);
      });
  }, [page, search, actionType]);

  useEffect(() => {
    if (user?.role === "superadmin") {
      loadData();
    }
  }, [user, loadData]);

  // Handle filter changes (reset to page 1)
  const handleFilterChange = (newType: string) => {
    setActionType(newType);
    setPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat("en-NG", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(new Date(date));

  const totalPages = Math.ceil(totalCount / pageSize);

  if (isLoading || !user || user.role !== "superadmin") {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-serif">
            Audit Logs
          </h1>
          <p className="text-gray-600 mt-2">
            Track administrative operations and security-critical events
          </p>
        </div>
      </div>

      {/* Summary card */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <HugeiconsIcon
              icon={Task01Icon}
              size={24}
              color="currentColor"
              className="text-primary"
            />
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900">
              {totalCount.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total recorded events</div>
          </div>
        </div>
      </div>

      {/* Controls: Search and Filters */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-4 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-3 w-full sm:w-auto flex-1 max-w-md">
          <div className="relative w-full">
            <Input
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search description, email, or IP..."
              className="pl-10"
            />
            <div className="absolute left-3 top-3.5 text-gray-400">
              <HugeiconsIcon icon={Search01Icon} size={16} />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <label className="text-sm font-semibold text-gray-700 whitespace-nowrap">
            Action Group:
          </label>
          <Select
            value={actionType}
            onValueChange={handleFilterChange}
          >
            <SelectTrigger className="w-[180px] sm:w-[240px]">
              <SelectValue placeholder="All Actions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Actions</SelectItem>
              <SelectItem value="AUTH">Authentication (AUTH_*)</SelectItem>
              <SelectItem value="USER">User Management (USER_*)</SelectItem>
              <SelectItem value="SUBSCRIBERS">Subscriber Operations (SUBSCRIBERS_*)</SelectItem>
              <SelectItem value="INCIDENT">Incident Actions (INCIDENT_*)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border-2 border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap w-[20%]">
                  Timestamp
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap w-[20%]">
                  Actor
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap w-[15%]">
                  Action
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap w-[35%]">
                  Description
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap w-[10%]">
                  IP Address
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {logs === null || loadingData ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-gray-500 text-sm"
                  >
                    Loading audit trail...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-gray-500 text-sm"
                  >
                    No audit logs found matching criteria.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                      {formatDate(log.timestamp)}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                      {log.userName ? (
                        <>
                          <span className="block">{log.userName}</span>
                          <span className="text-xs font-normal text-gray-500 block mt-0.5 select-all">
                            {log.userEmail}
                          </span>
                        </>
                      ) : (
                        <span className="text-gray-500 italic">System / Anonymous</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap">
                      <ActionBadge action={log.action} />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {log.description}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-mono whitespace-nowrap">
                      {log.ipAddress || <span className="text-gray-400">—</span>}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center p-4 border-t-2 border-gray-200 flex-wrap gap-3">
            <span className="text-sm text-gray-600">
              Showing page <strong className="font-semibold text-gray-900">{page}</strong> of{" "}
              <strong className="font-semibold text-gray-900">{totalPages}</strong> ({totalCount} total logs)
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-1"
              >
                <HugeiconsIcon icon={ArrowLeft01Icon} size={14} />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex items-center gap-1"
              >
                Next
                <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ActionBadge({ action }: { action: string }) {
  let styles = "bg-gray-100 text-gray-800";

  if (action === "AUTH_LOGIN_FAILURE") {
    styles = "bg-red-100 text-red-800 border border-red-200";
  } else if (action.startsWith("AUTH_")) {
    styles = "bg-blue-100 text-blue-800";
  } else if (action === "USER_DEACTIVATE") {
    styles = "bg-orange-100 text-orange-800 border border-orange-200";
  } else if (action === "USER_REACTIVATE") {
    styles = "bg-green-100 text-green-800";
  } else if (action.startsWith("USER_")) {
    styles = "bg-amber-100 text-amber-800";
  } else if (action.startsWith("SUBSCRIBERS_")) {
    styles = "bg-purple-100 text-purple-800";
  } else if (action.startsWith("INCIDENT_")) {
    styles = "bg-teal-100 text-teal-800";
  }

  return (
    <span
      className={`inline-block px-2.5 py-0.5 rounded text-xs font-semibold uppercase tracking-wide whitespace-nowrap ${styles}`}
    >
      {action.replace(/_/g, " ")}
    </span>
  );
}
