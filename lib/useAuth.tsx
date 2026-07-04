"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  signInAction,
  signOutAction,
  getCurrentUserAction,
  changePasswordAction,
} from "@/app/actions/auth";

interface AuthUser {
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
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Resolve the current user from the session cookie on mount
  useEffect(() => {
    getCurrentUserAction()
      .then((u) => setUser(u))
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  const signIn = async (email: string, password: string) => {
    const u = await signInAction(email, password);
    setUser(u);
  };

  const signOut = async () => {
    await signOutAction();
    setUser(null);
  };

  const changePassword = async (current: string, newPw: string) => {
    const u = await changePasswordAction(current, newPw);
    setUser(u);
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, signIn, signOut, changePassword }}
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
