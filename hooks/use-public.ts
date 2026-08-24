"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitContactAction } from "@/app/actions/contactSubmissions";
import { subscribeAction } from "@/app/actions/subscribers";
import { queryKeys } from "@/hooks/query-keys";

export function useSubmitContact() {
  return useMutation({
    mutationFn: (input: Parameters<typeof submitContactAction>[0]) => submitContactAction(input),
  });
}

export function useSubscribeNewsletter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (email: string) => subscribeAction(email),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.subscribers.all });
    },
  });
}
