"use client";

import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { getSubscribersAction, deleteSubscriberAction } from "@/app/actions/subscribers";
import { queryKeys } from "@/hooks/query-keys";

export function useSubscribersQuery(params: {
  page: number;
  pageSize?: number;
  search?: string;
}) {
  return useQuery({
    queryKey: queryKeys.subscribers.list(params),
    queryFn: () => getSubscribersAction(params),
    placeholderData: keepPreviousData,
  });
}

export function useDeleteSubscriber() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteSubscriberAction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.subscribers.all });
    },
  });
}
