"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

interface AuthContextType {
  user: { _id: Id<"users">; email: string; name: string } | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [sessionId, setSessionId] = useState<Id<"sessions"> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const signInAction = useAction(api.auth.signIn);
  const signUpAction = useAction(api.auth.signUp);
  const signOutMutation = useMutation(api.auth.signOut);

  const user = useQuery(
    api.users.viewer,
    sessionId ? { sessionId } : "skip"
  );

  // Load session from HTTP-only cookie on mount
  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (data.sessionId) {
          setSessionId(data.sessionId as Id<"sessions">);
        }
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const signIn = async (email: string, password: string) => {
    const result = await signInAction({ email, password });

    // Store session in HTTP-only cookie
    await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: result.sessionId }),
    });

    // Set session ID
    setSessionId(result.sessionId);
  };

  const signUp = async (email: string, password: string, name: string) => {
    const result = await signUpAction({ email, password, name });

    // Store session in HTTP-only cookie
    await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: result.sessionId }),
    });

    setSessionId(result.sessionId);
  };

  const signOut = async () => {
    if (sessionId) {
      await signOutMutation({ sessionId });
    }

    // Clear HTTP-only cookie
    await fetch("/api/auth/session", { method: "DELETE" });

    setSessionId(null);
  };

  return (
    <AuthContext.Provider value={{ user: user ?? null, isLoading, signIn, signUp, signOut }}>
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
