"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getAuditLogsAction } from "@/app/actions/audit";
import { queryKeys } from "@/hooks/query-keys";

export function useAuditLogsQuery(params: {
  page: number;
  pageSize?: number;
  search?: string;
  actionType?: string;
}) {
  return useQuery({
    queryKey: queryKeys.auditLogs.list(params),
    queryFn: async () => {
      const res = await getAuditLogsAction(params);
      return res;
    },
    placeholderData: keepPreviousData,
  });
}
