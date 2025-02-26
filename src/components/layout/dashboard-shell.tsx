"use client";

import { Sidebar } from "@/components/sidebar";
import { cn } from "@/lib/utils";

export function DashboardShell({
  children,
  title,
  description,
  className,
}: {
  children: React.ReactNode;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <div className="hidden md:block border-r bg-muted/40">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <span className="font-semibold">Notate</span>
          </div>
          <Sidebar />
        </div>
      </div>

      {/* Main Content */}
      <main className={cn("flex-1 p-4 md:p-8 overflow-auto", className)}>
        <div className="mb-6 space-y-0.5">
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
        {children}
      </main>
    </div>
  );
}
