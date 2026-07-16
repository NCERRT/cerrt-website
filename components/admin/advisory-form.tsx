"use client";

import { useState } from "react";
import { toast } from "sonner";
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
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  Delete01Icon,
} from "@hugeicons/core-free-icons";
import { validateFile } from "@/lib/fileValidation";
import {
  createAdvisoryAction,
  updateAdvisoryAction,
  type AdvisoryDetailWithUrls,
} from "@/app/actions/advisories";
import { StringListInput } from "@/components/ui/string-list-input";

interface AdvisoryFormProps {
  advisory?: AdvisoryDetailWithUrls;
  onSuccess: () => void;
}

export function AdvisoryForm({
  advisory,
  onSuccess,
}: AdvisoryFormProps) {
  const [formData, setFormData] = useState<{
    type: "standard" | "poster";
    title: string;
    overview: string;
    category: "general" | "individuals" | "organizations" | "kids";
    severity: "critical" | "high" | "medium" | "low";
    advisoryId: string;
    tags: string[];
    impact: string;
    affectedProducts: string[];
    recommendedActions: string[];
    references: string[];
  }>({
    type: (advisory?.type as "standard" | "poster") || "standard",
    title: advisory?.title || "",
    overview: advisory?.overview || advisory?.description || "",
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
    tags: advisory?.tags || [],
    impact: advisory?.impact || "",
    affectedProducts: advisory?.affectedProducts || [],
    recommendedActions: advisory?.recommendedActions || [],
    references: advisory?.references || [],
  });

  const [file, setFile] = useState<File | null>(null);
  const [posterItems, setPosterItems] = useState<{
    id: string;
    file: File | null;
    existingItem?: any;
  }[]>(
    advisory?.posterItems?.map((p) => ({
      id: p.id || Math.random().toString(),
      file: null,
      existingItem: p,
    })) || []
  );
  const [uploading, setUploading] = useState(false);
  const [fileError, setFileError] = useState("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFileError("");

    if (selectedFile) {
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

  const handlePosterFileChange = async (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile = e.target.files?.[0] || null;
    if (selectedFile) {
      const validation = await validateFile(selectedFile);
      if (!validation.valid || validation.fileType !== "image") {
        toast.error(validation.error || "Invalid image file");
        e.target.value = "";
        return;
      }
      const newItems = [...posterItems];
      newItems[index].file = selectedFile;
      setPosterItems(newItems);
    }
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

      if (formData.type === "standard" && file) {
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

      let uploadedPosterItems: any[] = [];
      if (formData.type === "poster") {
        let order = 0;
        for (const item of posterItems) {
          if (item.file) {
            const uploadData = new FormData();
            uploadData.append("file", item.file);
            const res = await fetch("/api/advisories/upload", {
              method: "POST",
              body: uploadData,
            });
            if (!res.ok) {
              const err = await res.json().catch(() => ({}));
              throw new Error(err.error || "Image upload failed");
            }
            const meta = await res.json();
            uploadedPosterItems.push({
              imageKey: meta.fileKey,
              fileName: meta.fileName,
              fileSize: meta.fileSize,
              order: order++,
            });
          } else if (item.existingItem) {
            uploadedPosterItems.push({
              imageKey: item.existingItem.imageKey,
              fileName: item.existingItem.fileName,
              fileSize: item.existingItem.fileSize,
              order: order++,
            });
          }
        }
      }

      const payload = {
        ...formData,
        description: formData.overview, // Ensure description is set
        file: fileMeta,
        posterItems: formData.type === "poster" ? uploadedPosterItems : [],
      };

      if (advisory) {
        await updateAdvisoryAction(advisory.id, payload);
      } else {
        await createAdvisoryAction(payload);
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
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto px-1">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="type">Advisory Type</Label>
          <Select
            value={formData.type}
            onValueChange={(value: "standard" | "poster") =>
              setFormData({ ...formData, type: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="standard">Standard</SelectItem>
              <SelectItem value="poster">Poster</SelectItem>
            </SelectContent>
          </Select>
        </div>
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
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
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
      </div>

      <div>
        <Label htmlFor="overview">Overview</Label>
        <Textarea
          id="overview"
          value={formData.overview}
          onChange={(e) =>
            setFormData({ ...formData, overview: e.target.value })
          }
          rows={3}
          maxLength={5000}
          required
        />
      </div>

      <StringListInput
        label="Tags"
        value={formData.tags}
        onChange={(v) => setFormData({ ...formData, tags: v })}
      />

      {formData.type === "standard" && (
        <>
          <div>
            <Label htmlFor="impact">Impact</Label>
            <Textarea
              id="impact"
              value={formData.impact}
              onChange={(e) => setFormData({ ...formData, impact: e.target.value })}
              rows={3}
            />
          </div>

          <StringListInput
            label="Affected Products"
            value={formData.affectedProducts}
            onChange={(v) => setFormData({ ...formData, affectedProducts: v })}
          />

          <StringListInput
            label="Recommended Actions"
            value={formData.recommendedActions}
            onChange={(v) => setFormData({ ...formData, recommendedActions: v })}
          />

          <StringListInput
            label="References"
            value={formData.references}
            onChange={(v) => setFormData({ ...formData, references: v })}
          />

          <div>
            <Label htmlFor="file">File (PDF or Image)</Label>
            <Input
              id="file"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp,.gif"
              onChange={handleFileChange}
            />
            {fileError && <p className="text-xs text-red-600 mt-1">{fileError}</p>}
            {advisory?.fileName && !file && (
              <p className="text-sm text-gray-600 mt-1">
                Current file: {advisory.fileName}
              </p>
            )}
          </div>
        </>
      )}

      {formData.type === "poster" && (
        <div className="space-y-4">
          <Label>Poster Images</Label>
          {posterItems.map((item, index) => (
            <div key={item.id} className="flex items-center gap-2">
              <div className="flex-1">
                <Input
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,.gif"
                  onChange={(e) => handlePosterFileChange(index, e)}
                />
                {item.existingItem && !item.file && (
                  <p className="text-sm text-gray-600 mt-1">
                    Current: {item.existingItem.fileName}
                  </p>
                )}
              </div>
              <Button
                type="button"
                variant="ghost"
                className="text-red-600"
                onClick={() =>
                  setPosterItems(posterItems.filter((_, i) => i !== index))
                }
              >
                <HugeiconsIcon icon={Delete01Icon} size={16} />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              setPosterItems([
                ...posterItems,
                { id: Math.random().toString(), file: null },
              ])
            }
          >
            <HugeiconsIcon icon={Add01Icon} size={16} className="mr-2" />
            Add Image
          </Button>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4 border-t">
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
