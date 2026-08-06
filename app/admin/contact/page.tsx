"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getContactSubmissionsAction,
  updateContactStatusAction,
} from "@/app/actions/contactSubmissions";
import type { ContactSubmission, ContactStatus } from "@prisma/client";

export default function ContactSubmissionsPage() {
  const [submissions, setSubmissions] = useState<ContactSubmission[] | null>(
    null,
  );
  const [selectedSubmission, setSelectedSubmission] =
    useState<ContactSubmission | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  const loadData = useCallback(() => {
    getContactSubmissionsAction(
      (filterStatus === "ALL" ? undefined : filterStatus) as
        | ContactStatus
        | undefined,
    )
      .then(setSubmissions)
      .catch(() => setSubmissions([]));
  }, [filterStatus]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateContactStatusAction(id, newStatus);
      toast.success("Status updated successfully");
      loadData();
    } catch (err) {
      toast.error((err as Error).message || "Failed to update status");
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "new":
        return "destructive";
      case "in_progress":
        return "default";
      case "resolved":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-serif">
            Contact Submissions
          </h1>
          <p className="text-gray-600 mt-2">
            View and manage inquiries from the contact form
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-45">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {submissions === null ? (
          <div className="p-8 text-center text-gray-500">
            Loading submissions...
          </div>
        ) : submissions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No contact submissions found.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell>
                    {new Intl.DateTimeFormat("en-NG", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    }).format(new Date(sub.submittedAt))}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-gray-900">{sub.name}</div>
                    <div className="text-xs text-gray-500">{sub.email}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {sub.inquiryType.replace(/_/g, " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-50 truncate">
                    {sub.subject}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={sub.status}
                      onValueChange={(val) => handleStatusChange(sub.id, val)}
                    >
                      <SelectTrigger className="w-32.5 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedSubmission(sub);
                        setIsViewOpen(true);
                      }}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-150">
          <DialogHeader>
            <DialogTitle>Submission Details</DialogTitle>
          </DialogHeader>
          {selectedSubmission && (
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-500">From</h4>
                  <p className="text-gray-900 font-medium">
                    {selectedSubmission.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    <a
                      href={`mailto:${selectedSubmission.email}`}
                      className="text-primary hover:underline"
                    >
                      {selectedSubmission.email}
                    </a>
                  </p>
                  {selectedSubmission.phone && (
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedSubmission.phone}
                    </p>
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-500">
                    Details
                  </h4>
                  <p className="text-sm text-gray-900 mt-1">
                    <span className="font-medium">Type:</span>{" "}
                    <span className="capitalize">
                      {selectedSubmission.inquiryType.replace(/_/g, " ")}
                    </span>
                  </p>
                  {selectedSubmission.organization && (
                    <p className="text-sm text-gray-900 mt-1">
                      <span className="font-medium">Org:</span>{" "}
                      {selectedSubmission.organization}
                    </p>
                  )}
                  <p className="text-sm text-gray-900 mt-1">
                    <span className="font-medium">Date:</span>{" "}
                    {new Intl.DateTimeFormat("en-NG", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }).format(new Date(selectedSubmission.submittedAt))}
                  </p>
                </div>
              </div>

              <div className="mt-6 border-t pt-4">
                <h4 className="text-sm font-semibold text-gray-500 mb-2">
                  Subject
                </h4>
                <p className="text-gray-900 font-medium">
                  {selectedSubmission.subject}
                </p>
              </div>

              <div className="mt-4">
                <h4 className="text-sm font-semibold text-gray-500 mb-2">
                  Message
                </h4>
                <div className="bg-gray-50 p-4 rounded-md border text-sm text-gray-800 whitespace-pre-wrap">
                  {selectedSubmission.message}
                </div>
              </div>

              <div className="mt-6 border-t pt-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">
                    Status:
                  </span>
                  <Badge
                    variant={getStatusBadgeVariant(selectedSubmission.status)}
                  >
                    {selectedSubmission.status.replace("_", " ").toUpperCase()}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Select
                    value={selectedSubmission.status}
                    onValueChange={(val) => {
                      handleStatusChange(selectedSubmission.id, val);
                      setSelectedSubmission({
                        ...selectedSubmission,
                        status: val as ContactStatus,
                      });
                    }}
                  >
                    <SelectTrigger className="w-35">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">Mark New</SelectItem>
                      <SelectItem value="in_progress">
                        Mark In Progress
                      </SelectItem>
                      <SelectItem value="resolved">Mark Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
