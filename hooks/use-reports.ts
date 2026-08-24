"use client";

import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import {
  getIncidentReportsAction,
  getIncidentReportByIdAction,
  getCaseCommunicationsAction,
  updateIncidentStatusAction,
  getIncidentStatsAction,
} from "@/app/actions/incidentReports";
import { queryKeys } from "@/hooks/query-keys";
import type { IncidentStatus, SubmissionChannel } from "@prisma/client";

export function useReportsQuery(params: {
  page: number;
  pageSize?: number;
  search?: string;
  status?: IncidentStatus;
  channel?: SubmissionChannel;
}) {
  return useQuery({
    queryKey: queryKeys.reports.list({
      page: params.page,
      search: params.search,
      status: params.status,
      channel: params.channel,
    }),
    queryFn: () => getIncidentReportsAction(params),
    placeholderData: keepPreviousData,
  });
}

export function useReportDetailQuery(id: string) {
  return useQuery({
    queryKey: queryKeys.reports.detail(id),
    queryFn: async () => {
      const [report, communications] = await Promise.all([
        getIncidentReportByIdAction(id),
        getCaseCommunicationsAction(id),
      ]);
      return { report, communications };
    },
    enabled: !!id,
  });
}

export function useIncidentStatsQuery() {
  return useQuery({
    queryKey: queryKeys.reports.stats(),
    queryFn: () => getIncidentStatsAction(),
  });
}

export function useUpdateReportStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      status,
      notes,
    }: {
      id: string;
      status: IncidentStatus;
      notes?: string;
    }) => updateIncidentStatusAction(id, status, notes),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reports.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.reports.detail(variables.id),
      });
    },
  });
}
