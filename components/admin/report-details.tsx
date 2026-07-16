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
