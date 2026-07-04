"use client";

import { ReactNode } from "react";
import { AuthProvider } from "@/lib/useAuth";
import { ConfirmProvider } from "@/components/ui/ConfirmDialog";
import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ConfirmProvider>
        {children}
        <Toaster />
      </ConfirmProvider>
    </AuthProvider>
  );
}
