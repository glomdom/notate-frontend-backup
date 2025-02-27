"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { JwtPayload } from "@/lib/types";
import { useQueryClient } from "@tanstack/react-query";

type AuthContextType = {
  user: JwtPayload | null;
  role: string | null;
  isLoading: boolean;
  logout: () => void;
  refreshAuth: () => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  isLoading: true,
  logout: () => { },
  refreshAuth: () => { },
});

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<{ user: JwtPayload | null; role: string | null; }>({
    user: null,
    role: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  const logout = useCallback(() => {
    localStorage.removeItem("authToken");
    setAuthState({ user: null, role: null });
    queryClient.clear();
    window.location.href = "/login";
  }, [queryClient]);

  const refreshAuth = useCallback(() => {
    const token = localStorage.getItem("authToken");
    console.log("refreshAuth token:", token);

    if (!token) {
      setIsLoading(false);

      return;
    }

    try {
      const decoded = jwtDecode<JwtPayload>(token);
      setAuthState({
        user: decoded,
        role: decoded.role,
      });
    } catch (error) {
      console.error("Error decoding token:", error);
      logout();
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    // Run on mount
    refreshAuth();
    window.addEventListener("storage", refreshAuth);
    return () => window.removeEventListener("storage", refreshAuth);
  }, [refreshAuth]);

  return (
    <AuthContext.Provider value={{
      user: authState.user,
      role: authState.role,
      isLoading,
      logout,
      refreshAuth,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
