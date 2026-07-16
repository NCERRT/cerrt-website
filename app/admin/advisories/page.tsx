"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { Button } from "@/components/ui/button";
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
import {
  getAdvisoriesAction,
  deleteAdvisoryAction,
  type AdvisoryDetailWithUrls,
} from "@/app/actions/advisories";
import { AdvisoryForm } from "@/components/admin/advisory-form";

export default function AdvisoriesPage() {
  const [advisories, setAdvisories] = useState<AdvisoryDetailWithUrls[] | null>(
    null,
  );
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingAdvisory, setEditingAdvisory] =
    useState<AdvisoryDetailWithUrls | null>(null);

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
                  Type
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
                    <Badge variant="outline" className="capitalize">
                      {advisory.type}
                    </Badge>
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
