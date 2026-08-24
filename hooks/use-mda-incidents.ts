"use client";

import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import {
  getMdaIncidentsAction,
  getMdaIncidentByIdAction,
  getMdaDashboardStatsAction,
  submitMdaIncidentReportAction,
  postMdaCaseCommunicationAction,
} from "@/app/actions/mdaPortal";
import { queryKeys } from "@/hooks/query-keys";

export function useMdaIncidentsQuery(params: {
  page: number;
  pageSize?: number;
  search?: string;
  status?: string;
}) {
  return useQuery({
    queryKey: queryKeys.mdaIncidents.list(params),
    queryFn: async () => {
      const res = await getMdaIncidentsAction(params);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    placeholderData: keepPreviousData,
  });
}

export function useMdaIncidentDetailQuery(id: string) {
  return useQuery({
    queryKey: queryKeys.mdaIncidents.detail(id),
    queryFn: async () => {
      const res = await getMdaIncidentByIdAction(id);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useMdaDashboardStatsQuery() {
  return useQuery({
    queryKey: queryKeys.mdaIncidents.dashboardStats(),
    queryFn: async () => {
      const res = await getMdaDashboardStatsAction();
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
  });
}

export function useSubmitMdaIncident() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof submitMdaIncidentReportAction>[0]) =>
      submitMdaIncidentReportAction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.mdaIncidents.all });
    },
  });
}

export function usePostMdaMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof postMdaCaseCommunicationAction>[0]) =>
      postMdaCaseCommunicationAction(data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.mdaIncidents.detail(variables.incidentId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.mdaIncidents.all });
    },
  });
}
