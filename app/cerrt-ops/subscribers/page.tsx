"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HugeiconsIcon } from "@hugeicons/react";
import { Download01Icon, Delete01Icon, MailAtSign02Icon, Search01Icon } from "@hugeicons/core-free-icons";
import { exportSubscribersCsvAction } from "@/app/actions/subscribers";
import { useSubscribersQuery, useDeleteSubscriber } from "@/hooks/use-subscribers";
import { TablePagination } from "@/components/ui/table-pagination";

export default function SubscribersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [exporting, setExporting] = useState(false);
  const pageSize = 15;

  const { data, isLoading, isError, error } = useSubscribersQuery({
    page,
    pageSize,
    search,
  });

  const subscribers = data?.subscribers ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const csv = await exportSubscribersCsvAction();
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const stamp = new Date().toISOString().slice(0, 10);
      a.download = `cerrt-subscribers-${stamp}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error((err as Error).message || "Failed to export subscribers");
    } finally {
      setExporting(false);
    }
  };

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat("en-NG", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));

  return (
    <div>
      <div className="flex justify-between items-start mb-8 gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-serif">
            Subscribers
          </h1>
          <p className="text-gray-600 mt-2">
            Email addresses subscribed to advisory notifications
          </p>
        </div>
        <Button
          onClick={handleExport}
          disabled={exporting || totalCount === 0}
          className="flex items-center gap-2"
        >
          <HugeiconsIcon
            icon={Download01Icon}
            size={16}
            color="currentColor"
          />
          {exporting ? "Exporting..." : "Export CSV"}
        </Button>
      </div>

      {/* Summary card */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <HugeiconsIcon
              icon={MailAtSign02Icon}
              size={24}
              color="currentColor"
              className="text-primary"
            />
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900">
              {totalCount.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total subscribers</div>
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="relative max-w-md">
          <Input
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search email address..."
            className="pl-10 text-xs"
          />
          <div className="absolute left-3 top-3 text-gray-400">
            <HugeiconsIcon icon={Search01Icon} size={16} />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">
                  Subscribed
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-gray-500 text-sm">
                    Loading subscribers...
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-red-600 text-sm">
                    {(error as Error)?.message || "Failed to load subscribers."}
                  </td>
                </tr>
              ) : subscribers.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-gray-500 text-sm">
                    No subscribers found matching criteria.
                  </td>
                </tr>
              ) : (
                subscribers.map((sub) => (
                  <tr key={sub.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 break-all">
                      {sub.email}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                      {formatDate(sub.subscribedAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DeleteSubscriberButton id={sub.id} email={sub.email} />
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
          itemLabel="subscribers"
        />
      </div>
    </div>
  );
}

function DeleteSubscriberButton({
  id,
  email,
}: {
  id: string;
  email: string;
}) {
  const confirm = useConfirm();
  const deleteMutation = useDeleteSubscriber();

  const handleDelete = async () => {
    const ok = await confirm({
      title: "Remove subscriber?",
      description: `Remove ${email} from the subscriber list?`,
      confirmLabel: "Remove",
      destructive: true,
    });
    if (!ok) return;

    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast.success("Subscriber removed");
      },
      onError: (err) => {
        toast.error((err as Error).message || "Failed to remove subscriber");
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
      aria-label={`Remove ${email}`}
    >
      <HugeiconsIcon icon={Delete01Icon} size={16} color="currentColor" />
    </Button>
  );
}
