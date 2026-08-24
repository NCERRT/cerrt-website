"use client";

import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import {
  getPersonalIncidentsAction,
  getPersonalIncidentDetailAction,
  requestOtpAction,
  verifyOtpAction,
} from "@/app/actions/personalAccess";
import { queryKeys } from "@/hooks/query-keys";

export function usePersonalIncidentsQuery(params: {
  page: number;
  pageSize?: number;
}) {
  return useQuery({
    queryKey: queryKeys.personalCases.list(params),
    queryFn: async () => {
      const res = await getPersonalIncidentsAction(params);
      if (!res.success) throw new Error(res.error);
      return res;
    },
    placeholderData: keepPreviousData,
  });
}

export function usePersonalIncidentDetailQuery(id: string) {
  return useQuery({
    queryKey: queryKeys.personalCases.detail(id),
    queryFn: async () => {
      const res = await getPersonalIncidentDetailAction(id);
      if (!res.success) throw new Error(res.error);
      return res.incident;
    },
    enabled: !!id,
  });
}

export function useRequestOtp() {
  return useMutation({
    mutationFn: (email: string) => requestOtpAction(email),
  });
}

export function useVerifyOtp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ email, otpCode }: { email: string; otpCode: string }) =>
      verifyOtpAction(email, otpCode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.personalCases.all });
    },
  });
}
