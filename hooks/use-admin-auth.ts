"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCurrentUserAction,
  signInAction,
  signOutAction,
  changePasswordAction,
  requestPasswordResetAction,
  resetPasswordAction,
} from "@/app/actions/auth";
import { queryKeys } from "@/hooks/query-keys";

export function useAdminSessionQuery() {
  return useQuery({
    queryKey: queryKeys.adminSession.current(),
    queryFn: async () => {
      try {
        const user = await getCurrentUserAction();
        return user;
      } catch {
        return null;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes stale time for session
  });
}

export function useAdminSignIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      signInAction(email, password),
    onSuccess: (res) => {
      if (res.success && res.data) {
        queryClient.setQueryData(queryKeys.adminSession.current(), res.data);
      }
    },
  });
}

export function useAdminSignOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => signOutAction(),
    onSuccess: () => {
      queryClient.setQueryData(queryKeys.adminSession.current(), null);
      queryClient.clear();
    },
  });
}

export function useAdminChangePassword() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ current, newPw }: { current: string; newPw: string }) =>
      changePasswordAction(current, newPw),
    onSuccess: (res) => {
      if (res.success && res.data) {
        queryClient.setQueryData(queryKeys.adminSession.current(), res.data);
      }
    },
  });
}

export function useRequestPasswordReset() {
  return useMutation({
    mutationFn: (email: string) => requestPasswordResetAction(email),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: ({ token, newPassword }: { token: string; newPassword: string }) =>
      resetPasswordAction(token, newPassword),
  });
}
