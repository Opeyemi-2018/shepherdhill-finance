"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from "react";
import { toast } from "sonner";

interface User {
  id: number;
  name: string;
  email: string;
  type: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isLoading: boolean;
  handleAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to set cookie
const setCookie = (name: string, value: string, days = 7) => {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(
    value
  )}; expires=${expires}; path=/; SameSite=Lax`;
};

// Helper to delete cookie
const deleteCookie = (name: string) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

const getInitialAuthState = (): { token: string | null; user: User | null } => {
  if (typeof window === "undefined") return { token: null, user: null };

  try {
    const token = localStorage.getItem("auth_token");
    const userStr = localStorage.getItem("auth_user");
    const user = userStr ? JSON.parse(userStr) : null;
    return { token, user };
  } catch (error) {
    console.warn("Failed to parse auth data from localStorage", error);
    return { token: null, user: null };
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const initial = getInitialAuthState();

  const [user, setUser] = useState<User | null>(initial.user);
  const [token, setToken] = useState<string | null>(initial.token);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const clearAuth = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    deleteCookie("auth_token");
  }, []);

  const logout = useCallback(() => {
    clearAuth();
    window.location.replace("/sign-in");
  }, [clearAuth]);

  const handleAuthError = useCallback(() => {
    clearAuth();
    toast.info("Your session has expired. Please sign in again.");
    window.location.replace("/sign-in");
  }, [clearAuth]);

  const login = useCallback((newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);

    localStorage.setItem("auth_token", newToken);
    localStorage.setItem("auth_user", JSON.stringify(newUser));

    setCookie("auth_token", newToken);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, token, login, logout, isLoading, handleAuthError }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};