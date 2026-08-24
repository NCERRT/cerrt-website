"use client";

import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import {
  getAdvisoriesAction,
  deleteAdvisoryAction,
  createAdvisoryAction,
  updateAdvisoryAction,
} from "@/app/actions/advisories";
import { queryKeys } from "@/hooks/query-keys";
import type { AdvisoryCategory } from "@prisma/client";

export function useAdvisoriesQuery(params: {
  page: number;
  pageSize?: number;
  category?: AdvisoryCategory;
}) {
  return useQuery({
    queryKey: queryKeys.advisories.list(params),
    queryFn: () => getAdvisoriesAction(params),
    placeholderData: keepPreviousData,
  });
}

export function useDeleteAdvisory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteAdvisoryAction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.advisories.all });
    },
  });
}

export function useCreateAdvisory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof createAdvisoryAction>[0]) =>
      createAdvisoryAction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.advisories.all });
    },
  });
}

export function useUpdateAdvisory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof updateAdvisoryAction>[1];
    }) => updateAdvisoryAction(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.advisories.all });
    },
  });
}
