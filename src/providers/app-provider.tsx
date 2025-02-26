"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { JwtPayload } from "@/lib/types";
import { useQueryClient } from "@tanstack/react-query";

type AuthContextType = {
  user: JwtPayload | null;
  role: string | null;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  logout: () => {},
});

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<{
    user: JwtPayload | null;
    role: string | null;
  }>({ user: null, role: null });
  const queryClient = useQueryClient();

  useEffect(() => {
    const verifyAuth = () => {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      try {
        const decoded = jwtDecode<JwtPayload>(token);
        setAuthState({
          user: decoded,
          role: decoded.role,
        });
      } catch {
        logout();
      }
    };

    verifyAuth();
    window.addEventListener("storage", verifyAuth);

    return () => window.removeEventListener("storage", verifyAuth);
  }, []);

  const logout = () => {
    localStorage.removeItem("authToken");
    setAuthState({ user: null, role: null });
    queryClient.clear();
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{
      user: authState.user,
      role: authState.role,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
