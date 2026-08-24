"use client";

import { ReactNode } from "react";
import { AuthProvider } from "@/lib/useAuth";
import { ConfirmProvider } from "@/components/ui/ConfirmDialog";
import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "@/components/providers/query-provider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>
        <ConfirmProvider>
          {children}
          <Toaster />
        </ConfirmProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
