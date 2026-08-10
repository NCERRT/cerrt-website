"use client";

import { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  DialogFooter,
} from "@/components/ui/dialog";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft02Icon,
  Alert02Icon,
  UserIcon,
  MailAtSign02Icon,
  CallIcon,
  Building01Icon,
  Shield01Icon,
} from "@hugeicons/core-free-icons";
import type { IncidentReport, IncidentStatus } from "@prisma/client";
import {
  getIncidentReportByIdAction,
  updateIncidentStatusAction,
} from "@/app/actions/incidentReports";

export default function IncidentReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [report, setReport] = useState<IncidentReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingNotes, setSavingNotes] = useState(false);

  // Form state
  const [status, setStatus] = useState<IncidentStatus>("new");
  const [pendingStatus, setPendingStatus] = useState<IncidentStatus | null>(null);
  const [notes, setNotes] = useState("");
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);

  const loadReport = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getIncidentReportByIdAction(id);
      if (!data) {
        toast.error("Incident report not found");
        router.push("/cerrt-ops/reports");
        return;
      }
      setReport(data);
      setStatus(data.status);
      setNotes(data.notes || "");
    } catch {
      toast.error("Failed to load incident report");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  const handleStatusSelect = (newStatus: IncidentStatus) => {
    if (newStatus === status) return;
    setPendingStatus(newStatus);
    setShowOverrideModal(true);
  };

  const confirmStatusOverride = async () => {
    if (!pendingStatus || !report) return;
    setSavingStatus(true);
    try {
      await updateIncidentStatusAction(report.id, pendingStatus, notes || undefined);
      setStatus(pendingStatus);
      toast.success(`Status manually updated to "${pendingStatus}"`);
      setShowOverrideModal(false);
      setPendingStatus(null);
      loadReport();
    } catch (error) {
      toast.error((error as Error).message || "Failed to update status");
    } finally {
      setSavingStatus(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!report) return;
    setSavingNotes(true);
    try {
      await updateIncidentStatusAction(report.id, status, notes || undefined);
      toast.success("Internal notes saved successfully");
      loadReport();
    } catch (error) {
      toast.error((error as Error).message || "Failed to save notes");
    } finally {
      setSavingNotes(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!report) return null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Breadcrumb & Navigation */}
      <div>
        <Link
          href="/cerrt-ops/reports"
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-primary transition-colors"
        >
          <HugeiconsIcon icon={ArrowLeft02Icon} size={16} />
          Back to Incident Reports
        </Link>
      </div>

      {/* Header Banner */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <Badge
              variant={
                report.status === "new"
                  ? "destructive"
                  : report.status === "resolved"
                  ? "default"
                  : "outline"
              }
              className="text-xs uppercase font-bold"
            >
              {report.status}
            </Badge>

            {report.severity && (
              <Badge
                variant={report.severity === "critical" ? "destructive" : "secondary"}
                className="text-xs uppercase"
              >
                Severity: {report.severity}
              </Badge>
            )}

            <span className="text-xs text-gray-500 font-mono">
              Submitted: {new Date(report.submittedAt).toLocaleString()}
            </span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 font-serif">
            {report.title || `Incident Report #${report.id.slice(-8)}`}
          </h1>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Report Data */}
        <div className="lg:col-span-2 space-y-6">
          {/* Reporter Contact Info */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 pb-2 border-b border-gray-100">
              Reporter Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <HugeiconsIcon icon={UserIcon} size={18} className="text-gray-400 mt-0.5" />
                <div>
                  <span className="text-xs text-gray-500 block">Full Name</span>
                  <span className="font-semibold text-gray-900">{report.contactName}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <HugeiconsIcon icon={MailAtSign02Icon} size={18} className="text-gray-400 mt-0.5" />
                <div>
                  <span className="text-xs text-gray-500 block">Email Address</span>
                  <a
                    href={`mailto:${report.contactEmail}`}
                    className="font-semibold text-primary hover:underline"
                  >
                    {report.contactEmail}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <HugeiconsIcon icon={CallIcon} size={18} className="text-gray-400 mt-0.5" />
                <div>
                  <span className="text-xs text-gray-500 block">Phone Number</span>
                  <span className="font-medium text-gray-900">{report.contactPhone}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <HugeiconsIcon icon={Building01Icon} size={18} className="text-gray-400 mt-0.5" />
                <div>
                  <span className="text-xs text-gray-500 block">Organization</span>
                  <span className="font-medium text-gray-900">{report.organization}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Incident Description */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500">
                Incident Description & Category
              </h2>
              <span className="text-xs font-semibold px-2.5 py-1 bg-gray-100 rounded-md text-gray-700">
                Type: {report.type}
              </span>
            </div>

            <div className="p-4 bg-gray-50/80 rounded-xl text-sm text-gray-900 leading-relaxed whitespace-pre-wrap">
              {report.description}
            </div>
          </div>

          {/* TheHive Integration Card */}
          {(report.thehiveCaseId || report.ticketId || report.hiveStatus) && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <HugeiconsIcon icon={Shield01Icon} size={20} className="text-primary" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900">
                    TheHive Analyst Sync
                  </h2>
                </div>
                {report.hiveStatus && (
                  <Badge variant="outline" className="text-xs font-bold uppercase border-primary/40 text-primary">
                    {report.hiveStatus}
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                {report.ticketId && (
                  <div>
                    <span className="text-gray-500 text-xs block font-medium">TheHive Ticket ID</span>
                    <span className="font-mono font-bold text-gray-900">{report.ticketId}</span>
                  </div>
                )}
                {report.thehiveCaseId && (
                  <div>
                    <span className="text-gray-500 text-xs block font-medium">Internal Case ID</span>
                    <span className="font-mono font-bold text-gray-900">{report.thehiveCaseId}</span>
                  </div>
                )}
                {report.hiveType && (
                  <div>
                    <span className="text-gray-500 text-xs block font-medium">Analyst Type</span>
                    <span className="font-semibold text-gray-900">{report.hiveType}</span>
                  </div>
                )}
                {report.hiveSeverity && (
                  <div>
                    <span className="text-gray-500 text-xs block font-medium">Analyst Severity</span>
                    <span className="font-semibold text-gray-900">{report.hiveSeverity}</span>
                  </div>
                )}
              </div>

              {report.hiveSummary && (
                <div className="pt-2">
                  <span className="text-gray-500 text-xs block font-semibold mb-1">
                    Analyst Investigation Summary
                  </span>
                  <div className="p-4 bg-gray-50 border border-gray-200/60 rounded-xl text-sm text-gray-900 whitespace-pre-wrap">
                    {report.hiveSummary}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Admin Actions & Notes */}
        <div className="space-y-6">
          {/* Status & Actions Control Card */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 pb-2 border-b border-gray-100">
              Manage Incident Status
            </h2>

            <div className="space-y-3">
              <Label htmlFor="status-select" className="text-sm font-medium text-gray-700">
                Current Status
              </Label>
              <Select
                value={status}
                onValueChange={(val) => handleStatusSelect(val as IncidentStatus)}
              >
                <SelectTrigger id="status-select" className="w-full h-11">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New (Unassigned)</SelectItem>
                  <SelectItem value="reviewing">Reviewing (In Progress)</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                Note: Status updates are synced automatically via TheHive integration. Manual changes trigger an override warning.
              </p>
            </div>
          </div>

          {/* Internal Notes Card */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 pb-2 border-b border-gray-100">
              Internal Admin Notes
            </h2>

            <div className="space-y-3">
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={6}
                placeholder="Add private internal notes about this report..."
                maxLength={2000}
                className="w-full text-sm"
              />
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{notes.length}/2000 chars</span>
                <Button onClick={handleSaveNotes} disabled={savingNotes} size="sm">
                  {savingNotes ? "Saving..." : "Save Notes"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Manual Status Override Confirmation Modal */}
      <Dialog open={showOverrideModal} onOpenChange={setShowOverrideModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-800">
              <HugeiconsIcon icon={Alert02Icon} size={22} className="text-amber-600" />
              Manual Status Override Warning
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-2 text-sm text-gray-700">
            <p>
              Incident status is automatically synchronized with <strong>TheHive</strong> incident response platform.
            </p>
            <p className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900">
              Are you sure you want to manually override this report&apos;s status to{" "}
              <strong className="uppercase">{pendingStatus}</strong>?
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowOverrideModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={confirmStatusOverride}
              disabled={savingStatus}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {savingStatus ? "Overriding..." : "Confirm Manual Override"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
