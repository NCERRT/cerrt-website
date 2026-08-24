"use client";

import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { getContactSubmissionsAction, updateContactStatusAction } from "@/app/actions/contactSubmissions";
import { queryKeys } from "@/hooks/query-keys";
import type { ContactStatus } from "@prisma/client";

export function useContactSubmissionsQuery(params: {
  page: number;
  pageSize?: number;
  search?: string;
  status?: ContactStatus;
}) {
  return useQuery({
    queryKey: queryKeys.contact.list(params),
    queryFn: () => getContactSubmissionsAction(params),
    placeholderData: keepPreviousData,
  });
}

export function useUpdateContactStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ContactStatus }) =>
      updateContactStatusAction(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.contact.all });
    },
  });
}
