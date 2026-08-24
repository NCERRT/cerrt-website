"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getDefacementStatsAction,
  upsertStatAction,
  deleteStatAction,
} from "@/app/actions/defacementStats";
import { queryKeys } from "@/hooks/query-keys";

export function useDefacementStatsQuery() {
  return useQuery({
    queryKey: queryKeys.statistics.list(),
    queryFn: () => getDefacementStatsAction(),
  });
}

export function useUpsertStat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      year,
      month,
      incidents,
    }: {
      year: number;
      month: number;
      incidents: number;
    }) => upsertStatAction(year, month, incidents),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.statistics.all });
    },
  });
}

export function useDeleteStat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteStatAction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.statistics.all });
    },
  });
}
