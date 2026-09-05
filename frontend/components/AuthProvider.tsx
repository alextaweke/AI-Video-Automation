"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AuthResponse,
  AuthUser,
  clearAuthSession,
  getStoredUser,
  storeAuthSession,
  storeAuthUser,
} from "@/lib/auth";

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isReady: boolean;
  signIn: (auth: AuthResponse) => void;
  signOut: () => void;
  updateUser: (user: AuthUser) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      setUser(getStoredUser());
      setIsReady(true);
    });
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isReady,
      signIn(auth: AuthResponse) {
        storeAuthSession(auth);
        setUser(auth.user);
      },
      signOut() {
        clearAuthSession();
        setUser(null);
      },
      updateUser(user: AuthUser) {
        storeAuthUser(user);
        setUser(user);
      },
    }),
    [isReady, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
