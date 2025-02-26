"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { JwtPayload } from "@/lib/types";

export const ProtectedRoute = ({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles?: string[];
}) => {
  const router = useRouter();

  useEffect(() => {
    const verifyAuth = () => {
      const token = localStorage.getItem("authToken");
      if (!token) return router.push("/login");

      try {
        const decoded = jwtDecode<JwtPayload>(token);

        if (allowedRoles && !allowedRoles.includes(decoded.role)) {
          router.push("/dashboard");
        }
      } catch {
        localStorage.removeItem("authToken");

        router.push("/login");
      }
    };

    verifyAuth();
    window.addEventListener("storage", verifyAuth);

    return () => window.removeEventListener("storage", verifyAuth);
  }, [router, allowedRoles]);

  return <>{children}</>;
};
