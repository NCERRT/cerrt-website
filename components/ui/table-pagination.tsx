"use client";

import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";

export interface TablePaginationProps {
  page: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (newPage: number) => void;
  itemLabel?: string;
}

export function TablePagination({
  page,
  totalPages,
  totalCount,
  onPageChange,
  itemLabel = "items",
}: TablePaginationProps) {
  if (totalCount === 0) return null;

  const displayTotalPages = Math.max(1, totalPages);

  return (
    <div className="flex justify-between items-center p-4 border-t border-slate-200 flex-wrap gap-3 bg-white rounded-b-2xl">
      <span className="text-xs text-slate-600">
        Showing page{" "}
        <strong className="font-semibold text-slate-900">{page}</strong> of{" "}
        <strong className="font-semibold text-slate-900">{displayTotalPages}</strong>{" "}
        ({totalCount} total {itemLabel})
      </span>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1}
          className="flex items-center gap-1 text-xs font-semibold h-8 rounded-lg"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={14} />
          Previous
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.min(displayTotalPages, page + 1))}
          disabled={page >= displayTotalPages}
          className="flex items-center gap-1 text-xs font-semibold h-8 rounded-lg"
        >
          Next
          <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
        </Button>
      </div>
    </div>
  );
}
