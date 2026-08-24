"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getTeamMembersAction,
  inviteAdminAction,
  resendInviteAction,
  toggleTeamMemberActiveAction,
} from "@/app/actions/team";
import { queryKeys } from "@/hooks/query-keys";

export function useTeamMembersQuery() {
  return useQuery({
    queryKey: queryKeys.team.list(),
    queryFn: () => getTeamMembersAction(),
  });
}

export function useInviteAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { email: string; name: string }) => inviteAdminAction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.team.all });
    },
  });
}

export function useResendInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => resendInviteAction(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.team.all });
    },
  });
}

export function useToggleTeamMemberActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => toggleTeamMemberActiveAction(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.team.all });
    },
  });
}
