"use client";

import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import {
  getMdaRegistrationsAction,
  getMdaOrganizationsAction,
  approveMdaRegistrationAction,
  rejectMdaRegistrationAction,
  toggleMdaOrganizationActiveAction,
} from "@/app/actions/mdaRegistration";
import { queryKeys } from "@/hooks/query-keys";

export function useMdaRegistrationsQuery(params: {
  page: number;
  pageSize?: number;
  search?: string;
  statusFilter?: "pending" | "approved" | "rejected" | "ALL";
}) {
  return useQuery({
    queryKey: queryKeys.mdaRegistrations.list(params),
    queryFn: async () => {
      const res = await getMdaRegistrationsAction(params);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    placeholderData: keepPreviousData,
  });
}

export function useMdaOrganizationsQuery(params: {
  page: number;
  pageSize?: number;
  search?: string;
}) {
  return useQuery({
    queryKey: queryKeys.mdaOrganizations.list(params),
    queryFn: async () => {
      const res = await getMdaOrganizationsAction(params);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    placeholderData: keepPreviousData,
  });
}

export function useApproveMdaRegistration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (registrationId: string) =>
      approveMdaRegistrationAction(registrationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.mdaRegistrations.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.mdaOrganizations.all });
    },
  });
}

export function useRejectMdaRegistration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      registrationId,
      reason,
    }: {
      registrationId: string;
      reason: string;
    }) => rejectMdaRegistrationAction(registrationId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.mdaRegistrations.all });
    },
  });
}

export function useToggleMdaOrgActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (organizationId: string) =>
      toggleMdaOrganizationActiveAction(organizationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.mdaOrganizations.all });
    },
  });
}
