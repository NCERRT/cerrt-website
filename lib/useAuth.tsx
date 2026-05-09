"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

interface AuthContextType {
  user: { _id: Id<"users">; email: string; name: string } | null;
  sessionId: Id<"sessions"> | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [sessionId, setSessionId] = useState<Id<"sessions"> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const signInAction = useAction(api.auth.signIn);
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

  const signOut = async () => {
    if (sessionId) {
      await signOutMutation({ sessionId });
    }

    // Clear HTTP-only cookie
    await fetch("/api/auth/session", { method: "DELETE" });

    setSessionId(null);
  };

  return (
    <AuthContext.Provider value={{ user: user ?? null, sessionId, isLoading, signIn, signOut }}>
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
