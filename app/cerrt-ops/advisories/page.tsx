"use client";

import { useState } from "react";
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
  Edit01Icon,
  Delete01Icon,
  FileScriptIcon,
} from "@hugeicons/core-free-icons";
import type { AdvisoryCategory } from "@prisma/client";
import { type AdvisoryDetailWithUrls } from "@/app/actions/advisories";
import { useAdvisoriesQuery, useDeleteAdvisory } from "@/hooks/use-advisories";
import { AdvisoryForm } from "@/components/admin/advisory-form";
import { TablePagination } from "@/components/ui/table-pagination";

export default function AdvisoriesPage() {
  const [page, setPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingAdvisory, setEditingAdvisory] = useState<AdvisoryDetailWithUrls | null>(null);
  const pageSize = 12;

  const currentCategoryParam = (categoryFilter === "ALL" ? undefined : categoryFilter) as AdvisoryCategory | undefined;

  const { data, isLoading, isError, error } = useAdvisoriesQuery({
    page,
    pageSize,
    category: currentCategoryParam,
  });

  const advisories = data?.advisories ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  const handleCategoryChange = (val: string) => {
    setCategoryFilter(val);
    setPage(1);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-serif">
            Advisories
          </h1>
          <p className="text-gray-600 mt-2">
            Manage security advisories and publications
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Select value={categoryFilter} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-48 text-xs font-medium">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Categories</SelectItem>
              <SelectItem value="organizations">Organizations</SelectItem>
              <SelectItem value="individuals">Individuals</SelectItem>
              <SelectItem value="kids">Kids</SelectItem>
            </SelectContent>
          </Select>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2 text-xs font-semibold">
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
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Advisories List */}
      <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
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
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500 text-sm">
                    Loading advisories...
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-red-600 text-sm">
                    {(error as Error)?.message || "Failed to load advisories."}
                  </td>
                </tr>
              ) : advisories.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500 text-sm">
                    No advisories found matching criteria.
                  </td>
                </tr>
              ) : (
                advisories.map((advisory) => (
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
                        <DeleteButton advisoryId={advisory.id} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Shared Pagination Component */}
        <TablePagination
          page={page}
          totalPages={totalPages}
          totalCount={totalCount}
          onPageChange={setPage}
          itemLabel="advisories"
        />
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
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function DeleteButton({ advisoryId }: { advisoryId: string }) {
  const confirm = useConfirm();
  const deleteMutation = useDeleteAdvisory();

  const handleDelete = async () => {
    const ok = await confirm({
      title: "Delete advisory?",
      description: "This action cannot be undone.",
      confirmLabel: "Delete",
      destructive: true,
    });
    if (!ok) return;

    deleteMutation.mutate(advisoryId, {
      onSuccess: () => {
        toast.success("Advisory deleted");
      },
      onError: (err) => {
        toast.error((err as Error).message || "Failed to delete advisory");
      },
    });
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleDelete}
      disabled={deleteMutation.isPending}
      className="text-red-600 hover:text-red-700 hover:bg-red-50"
    >
      <HugeiconsIcon icon={Delete01Icon} size={16} color="currentColor" />
    </Button>
  );
}
