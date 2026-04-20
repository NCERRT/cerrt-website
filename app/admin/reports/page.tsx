"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/lib/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { HugeiconsIcon } from "@hugeicons/react";
import { Alert02Icon, CheckmarkCircle02Icon, Clock01Icon } from "@hugeicons/core-free-icons";
import type { Id } from "@/convex/_generated/dataModel";

export default function ReportsPage() {
  const [statusFilter, setStatusFilter] = useState<
    "new" | "reviewing" | "resolved" | "closed" | undefined
  >(undefined);
  const reports = useQuery(
    api.incidentReports.list,
    statusFilter ? { status: statusFilter } : {},
  );
  const stats = useQuery(api.incidentReports.getStats, {});
  const [selectedReport, setSelectedReport] = useState<{
    _id: Id<"incidentReports">;
    type: string;
    description: string;
    status: "new" | "reviewing" | "resolved" | "closed";
    submittedAt: number;
    contactName?: string;
    contactEmail?: string;
    contactPhone?: string;
    organization?: string;
    severity?: string;
    notes?: string;
  } | null>(null);

  const statusCounts = [
    { label: "All", value: undefined, count: stats?.total || 0, icon: Alert02Icon, color: "bg-gray-500" },
    { label: "New", value: "new", count: stats?.new || 0, icon: Alert02Icon, color: "bg-red-500" },
    { label: "Reviewing", value: "reviewing", count: stats?.reviewing || 0, icon: Clock01Icon, color: "bg-yellow-500" },
    { label: "Resolved", value: "resolved", count: stats?.resolved || 0, icon: CheckmarkCircle02Icon, color: "bg-green-500" },
    { label: "Closed", value: "closed", count: stats?.closed || 0, icon: CheckmarkCircle02Icon, color: "bg-gray-400" },
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
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        {statusCounts.map((stat) => (
          <button
            key={stat.label}
            onClick={() => setStatusFilter(stat.value as "new" | "reviewing" | "resolved" | "closed" | undefined)}
            className={`bg-white rounded-xl border-2 p-6 text-left hover:shadow-lg transition-all ${
              statusFilter === stat.value
                ? "border-primary"
                : "border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`${stat.color} w-10 h-10 rounded-lg flex items-center justify-center`}
              >
                <HugeiconsIcon
                  icon={stat.icon}
                  size={20}
                  color="white"
                />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {stat.count}
            </div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </button>
        ))}
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
                <tr key={report._id} className="hover:bg-gray-50">
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
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function ReportDetails({
  report,
  onClose,
}: {
  report: {
    _id: Id<"incidentReports">;
    type: string;
    description: string;
    status: "new" | "reviewing" | "resolved" | "closed";
    submittedAt: number;
    contactName?: string;
    contactEmail?: string;
    contactPhone?: string;
    organization?: string;
    severity?: string;
    notes?: string;
  };
  onClose: () => void;
}) {
  const { user } = useAuth();
  const [status, setStatus] = useState<"new" | "reviewing" | "resolved" | "closed">(report.status);
  const [notes, setNotes] = useState(report.notes || "");
  const [saving, setSaving] = useState(false);

  const updateStatus = useMutation(api.incidentReports.updateStatus);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateStatus({
        id: report._id,
        status,
        userId: user._id,
        notes: notes || undefined,
      });
      onClose();
    } catch (error) {
      console.error("Error updating report:", error);
      alert("Failed to update report");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm text-gray-600">Type</Label>
          <div className="font-medium">{report.type}</div>
        </div>
        <div>
          <Label className="text-sm text-gray-600">Severity</Label>
          <div className="font-medium">
            {report.severity || <span className="text-gray-400">-</span>}
          </div>
        </div>
      </div>

      <div>
        <Label className="text-sm text-gray-600">Description</Label>
        <div className="mt-1 p-4 bg-gray-50 rounded-lg text-sm">
          {report.description}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm text-gray-600">Contact Name</Label>
          <div className="font-medium">
            {report.contactName || (
              <span className="text-gray-400">Not provided</span>
            )}
          </div>
        </div>
        <div>
          <Label className="text-sm text-gray-600">Contact Email</Label>
          <div className="font-medium">
            {report.contactEmail || (
              <span className="text-gray-400">Not provided</span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm text-gray-600">Phone</Label>
          <div className="font-medium">
            {report.contactPhone || (
              <span className="text-gray-400">Not provided</span>
            )}
          </div>
        </div>
        <div>
          <Label className="text-sm text-gray-600">Organization</Label>
          <div className="font-medium">
            {report.organization || (
              <span className="text-gray-400">Not provided</span>
            )}
          </div>
        </div>
      </div>

      <div>
        <Label className="text-sm text-gray-600">Submitted At</Label>
        <div className="font-medium">
          {new Date(report.submittedAt).toLocaleString()}
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="font-bold mb-4">Update Status</h3>

        <div className="space-y-4">
          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              value={status}
              onValueChange={(value) => setStatus(value as "new" | "reviewing" | "resolved" | "closed")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="reviewing">Reviewing</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="notes">Notes (Internal)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="Add internal notes about this report..."
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
