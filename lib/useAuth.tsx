"use client";

import { createContext, useContext, ReactNode } from "react";
import {
  useAdminSessionQuery,
  useAdminSignIn,
  useAdminSignOut,
  useAdminChangePassword,
} from "@/hooks/use-admin-auth";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  mustChangePassword: boolean;
  role: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  changePassword: (current: string, newPw: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: user = null, isLoading } = useAdminSessionQuery();
  const signInMutation = useAdminSignIn();
  const signOutMutation = useAdminSignOut();
  const changePasswordMutation = useAdminChangePassword();

  const signIn = async (email: string, password: string) => {
    const res = await signInMutation.mutateAsync({ email, password });
    if (!res.success) {
      throw new Error(res.error);
    }
  };

  const signOut = async () => {
    await signOutMutation.mutateAsync();
  };

  const changePassword = async (current: string, newPw: string) => {
    const res = await changePasswordMutation.mutateAsync({ current, newPw });
    if (!res.success) {
      throw new Error(res.error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        signIn,
        signOut,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
