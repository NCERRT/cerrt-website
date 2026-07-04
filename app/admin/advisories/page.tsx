"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  Edit01Icon,
  Delete01Icon,
  FileScriptIcon,
} from "@hugeicons/core-free-icons";
import { validateFile } from "@/lib/fileValidation";
import {
  getAdvisoriesAction,
  createAdvisoryAction,
  updateAdvisoryAction,
  deleteAdvisoryAction,
  type AdvisoryWithFileUrl,
} from "@/app/actions/advisories";

export default function AdvisoriesPage() {
  const [advisories, setAdvisories] = useState<AdvisoryWithFileUrl[] | null>(
    null,
  );
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingAdvisory, setEditingAdvisory] =
    useState<AdvisoryWithFileUrl | null>(null);

  const loadData = useCallback(() => {
    getAdvisoriesAction()
      .then(setAdvisories)
      .catch(() => setAdvisories([]));
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-serif">
            Advisories
          </h1>
          <p className="text-gray-600 mt-2">
            Manage security advisories and publications
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <HugeiconsIcon icon={Add01Icon} size={16} color="currentColor" />
              New Advisory
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Advisory</DialogTitle>
            </DialogHeader>
            <AdvisoryForm
              onSuccess={() => {
                setIsCreateOpen(false);
                loadData();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Advisories List */}
      <div className="bg-white rounded-xl border-2 border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">
                  Advisory ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">
                  Title
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">
                  Category
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">
                  Severity
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">
                  Date
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {advisories?.map((advisory) => (
                <tr key={advisory.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-primary">
                    {advisory.advisoryId}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {advisory.fileType && (
                        <HugeiconsIcon
                          icon={FileScriptIcon}
                          size={16}
                          color="currentColor"
                          className="text-gray-400"
                        />
                      )}
                      <span className="text-sm font-medium text-gray-900">
                        {advisory.title}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="outline">{advisory.category}</Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      variant={
                        advisory.severity === "critical"
                          ? "destructive"
                          : "default"
                      }
                    >
                      {advisory.severity}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(advisory.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingAdvisory(advisory)}
                      >
                        <HugeiconsIcon
                          icon={Edit01Icon}
                          size={16}
                          color="currentColor"
                        />
                      </Button>
                      <DeleteButton
                        advisoryId={advisory.id}
                        onDeleted={loadData}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {advisories?.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">
              No advisories yet. Create one to get started.
            </p>
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      {editingAdvisory && (
        <Dialog
          open={!!editingAdvisory}
          onOpenChange={() => setEditingAdvisory(null)}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Advisory</DialogTitle>
            </DialogHeader>
            <AdvisoryForm
              advisory={editingAdvisory}
              onSuccess={() => {
                setEditingAdvisory(null);
                loadData();
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function AdvisoryForm({
  advisory,
  onSuccess,
}: {
  advisory?: AdvisoryWithFileUrl;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    category: "general" | "individuals" | "organizations" | "kids";
    severity: "critical" | "high" | "medium" | "low";
    advisoryId: string;
  }>({
    title: advisory?.title || "",
    description: advisory?.description || "",
    category:
      (advisory?.category as
        | "general"
        | "individuals"
        | "organizations"
        | "kids") || "general",
    severity:
      (advisory?.severity as "critical" | "high" | "medium" | "low") ||
      "medium",
    advisoryId: advisory?.advisoryId || "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [fileError, setFileError] = useState("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFileError("");

    if (selectedFile) {
      // Comprehensive validation with magic-number verification
      const validation = await validateFile(selectedFile);
      if (!validation.valid) {
        setFileError(validation.error || "Invalid file");
        setFile(null);
        e.target.value = "";
        return;
      }
    }

    setFile(selectedFile);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (fileError) {
      toast.error("Please fix file errors before submitting");
      return;
    }

    setUploading(true);

    try {
      let fileMeta:
        | {
            fileKey: string;
            fileType: "pdf" | "image";
            fileName: string;
            fileSize: number;
          }
        | undefined;

      // Upload the file (if any) via the validated upload route
      if (file) {
        const validation = await validateFile(file);
        if (!validation.valid || !validation.fileType) {
          throw new Error(validation.error || "Invalid file type");
        }

        const uploadData = new FormData();
        uploadData.append("file", file);
        const res = await fetch("/api/advisories/upload", {
          method: "POST",
          body: uploadData,
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "File upload failed");
        }
        fileMeta = await res.json();
      }

      if (advisory) {
        await updateAdvisoryAction(advisory.id, { ...formData, file: fileMeta });
      } else {
        await createAdvisoryAction({ ...formData, file: fileMeta });
      }

      toast.success("Advisory saved successfully");
      onSuccess();
    } catch (error) {
      toast.error((error as Error).message || "Failed to save advisory");
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="advisoryId">Advisory ID</Label>
          <Input
            id="advisoryId"
            value={formData.advisoryId}
            onChange={(e) =>
              setFormData({
                ...formData,
                advisoryId: e.target.value.toUpperCase(),
              })
            }
            placeholder="NCA-130226-01"
            pattern="^NCA-\d{6}-\d{2}$"
            title="Format: NCA-DDMMYY-NN (e.g., NCA-130226-01)"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Format: NCA-DDMMYY-NN (e.g., NCA-130226-01 for 1st advisory on 13
            Feb 2026)
          </p>
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <Select
            value={formData.category}
            onValueChange={(value) =>
              setFormData({
                ...formData,
                category: value as
                  | "general"
                  | "individuals"
                  | "organizations"
                  | "kids",
              })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general">General</SelectItem>
              <SelectItem value="individuals">Individuals</SelectItem>
              <SelectItem value="organizations">Organizations</SelectItem>
              <SelectItem value="kids">Kids</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          maxLength={200}
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          {formData.title.length}/200 characters
        </p>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          rows={4}
          maxLength={5000}
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          {formData.description.length}/5000 characters
        </p>
      </div>

      <div>
        <Label htmlFor="severity">Severity</Label>
        <Select
          value={formData.severity}
          onValueChange={(value) =>
            setFormData({
              ...formData,
              severity: value as "critical" | "high" | "medium" | "low",
            })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="file">File (PDF or Image)</Label>
        <Input
          id="file"
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.webp,.gif"
          onChange={handleFileChange}
        />
        <p className="text-xs text-gray-500 mt-1">
          PDF: max 10MB | Images (JPEG, PNG, WebP, GIF): max 5MB
        </p>
        {fileError && <p className="text-xs text-red-600 mt-1">{fileError}</p>}
        {advisory?.fileName && !file && (
          <p className="text-sm text-gray-600 mt-1">
            Current file: {advisory.fileName}
          </p>
        )}
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Cancel
        </Button>
        <Button type="submit" disabled={uploading}>
          {uploading ? "Saving..." : advisory ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  );
}

function DeleteButton({
  advisoryId,
  onDeleted,
}: {
  advisoryId: string;
  onDeleted: () => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const confirm = useConfirm();

  const handleDelete = async () => {
    const ok = await confirm({
      title: "Delete advisory?",
      description: "This action cannot be undone.",
      confirmLabel: "Delete",
      destructive: true,
    });
    if (!ok) return;

    setDeleting(true);
    try {
      await deleteAdvisoryAction(advisoryId);
      toast.success("Advisory deleted");
      onDeleted();
    } catch (error) {
      toast.error((error as Error).message || "Failed to delete advisory");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleDelete}
      disabled={deleting}
      className="text-red-600 hover:text-red-700 hover:bg-red-50"
    >
      <HugeiconsIcon icon={Delete01Icon} size={16} color="currentColor" />
    </Button>
  );
}
