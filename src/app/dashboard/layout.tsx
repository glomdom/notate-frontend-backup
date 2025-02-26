"use client";

import { Sidebar } from "@/components/sidebar";
import { ProtectedRoute } from "@/components/layout/protected-route";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col md:flex-row">
        <Sidebar />
        <main className="flex-1 p-4 md:p-8 overflow-auto">{children}</main>
      </div>
    </ProtectedRoute>
  );
}
