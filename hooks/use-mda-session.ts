"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMdaSessionAction, mdaLoginAction, mdaLogoutAction } from "@/app/actions/mdaAuth";
import { queryKeys } from "@/hooks/query-keys";

export function useMdaSessionQuery() {
  return useQuery({
    queryKey: queryKeys.mdaSession.current(),
    queryFn: async () => {
      const user = await getMdaSessionAction();
      return user;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes stale time
  });
}

export function useMdaLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof mdaLoginAction>[0]) => mdaLoginAction(data),
    onSuccess: (res) => {
      if (res.success && res.data) {
        queryClient.setQueryData(queryKeys.mdaSession.current(), res.data);
      }
    },
  });
}

export function useMdaLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => mdaLogoutAction(),
    onSuccess: () => {
      queryClient.setQueryData(queryKeys.mdaSession.current(), null);
      queryClient.clear();
    },
  });
}
