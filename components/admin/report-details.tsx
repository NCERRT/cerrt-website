"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { IncidentReport, IncidentStatus } from "@prisma/client";
import { updateIncidentStatusAction } from "@/app/actions/incidentReports";

interface ReportDetailsProps {
  report: IncidentReport;
  onClose: () => void;
  onSaved: () => void;
}

export function ReportDetails({
  report,
  onClose,
  onSaved,
}: ReportDetailsProps) {
  const [status, setStatus] = useState<IncidentStatus>(report.status);
  const [notes, setNotes] = useState(report.notes || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateIncidentStatusAction(report.id, status, notes || undefined);
      toast.success("Report updated successfully");
      onSaved();
      onClose();
    } catch (error) {
      toast.error((error as Error).message || "Failed to update report");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {report.title && (
        <div>
          <Label className="text-sm text-gray-600">Subject / Title</Label>
          <div className="font-semibold text-base text-gray-900">{report.title}</div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm text-gray-600">Type (Reporter)</Label>
          <div className="font-medium">{report.type}</div>
        </div>
        <div>
          <Label className="text-sm text-gray-600">Severity (Reporter)</Label>
          <div className="font-medium">
            {report.severity || <span className="text-gray-400">-</span>}
          </div>
        </div>
      </div>

      {/* TheHive Integration Section */}
      {(report.thehiveCaseId || report.ticketId || report.hiveStatus) && (
        <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-800">
              TheHive Integration
            </h4>
            {report.hiveStatus && (
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                {report.hiveStatus}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            {report.ticketId && (
              <div>
                <span className="text-gray-500 text-xs block">Ticket ID</span>
                <span className="font-mono font-medium">{report.ticketId}</span>
              </div>
            )}
            {report.thehiveCaseId && (
              <div>
                <span className="text-gray-500 text-xs block">Case ID</span>
                <span className="font-mono font-medium">{report.thehiveCaseId}</span>
              </div>
            )}
            {report.hiveType && (
              <div>
                <span className="text-gray-500 text-xs block">Analyst Type</span>
                <span className="font-medium text-blue-900">{report.hiveType}</span>
              </div>
            )}
            {report.hiveSeverity && (
              <div>
                <span className="text-gray-500 text-xs block">Analyst Severity</span>
                <span className="font-medium text-blue-900">{report.hiveSeverity}</span>
              </div>
            )}
          </div>

          {report.hiveSummary && (
            <div>
              <span className="text-gray-500 text-xs block mb-1">Analyst Summary / Notes</span>
              <div className="p-3 bg-white border border-blue-100 rounded-lg text-sm text-gray-800 whitespace-pre-wrap">
                {report.hiveSummary}
              </div>
            </div>
          )}
        </div>
      )}

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
