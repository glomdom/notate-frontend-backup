"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ClipboardList, LayoutDashboard, Library, Menu, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { JSX, useCallback, useEffect, useMemo, useState } from "react";

interface NavItem {
  title: string;
  href: string;
  icon: string;
}

const teacherNav: NavItem[] = [
  { title: "Dashboard", href: "/dashboard/teacher", icon: "layout-dashboard" },
  { title: "Subjects", href: "/dashboard/teacher/subjects", icon: "users" },
  { title: "Assignments", href: "/dashboard/teacher/assignments", icon: "library" },
  { title: "Gradebook", href: "/dashboard/teacher/gradebook", icon: "clipboard-list" },
];

const studentNav: NavItem[] = [
  { title: "Dashboard", href: "/dashboard/student", icon: "layout-dashboard" },
  { title: "Submissions", href: "/dashboard/student/submissions", icon: "upload" },
];

const adminNav: NavItem[] = [
  { title: "Dashboard", href: "/dashboard/admin", icon: "layout-dashboard" },
  { title: "Users", href: "/dashboard/admin/users", icon: "users" },
  { title: "System Settings", href: "/dashboard/admin/settings", icon: "settings" },
  { title: "Reports", href: "/dashboard/admin/reports", icon: "file-text" },
];

const iconMap: Record<string, JSX.Element> = {
  "layout-dashboard": <LayoutDashboard size={18} />,
  "users": <Users size={18} />,
  "library": <Library size={18} />,
  "clipboard-list": <ClipboardList size={18} />,
};

export function Sidebar({ className }: React.HTMLAttributes<HTMLDivElement>) {
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);

  const getRoleFromToken = useCallback(() => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return null;

      const payload = JSON.parse(atob(token.split('.')[1]));

      return payload.role;
    } catch (error) {
      console.error('Error decoding token:', error);

      return null;
    }
  }, []);

  const navItems = useMemo(() => {
    if (role === 'admin') return adminNav;
    if (role === 'teacher') return teacherNav;
    if (role === 'student') return studentNav;

    return [];
  }, [role]);

  useEffect(() => {
    const userRole = getRoleFromToken();
    setRole(userRole);

    if (!userRole) window.location.href = '/login';
  }, [getRoleFromToken]);

  if (!role) return null;

  return (
    <>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col">
          <nav className="grid gap-2 text-lg font-medium">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                  pathname === item.href && "bg-muted text-primary"
                )}
              >
                {iconMap[item.icon]}
                <span>{item.title}</span>
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>

      <div className={cn("hidden border-r bg-muted/40 md:block", className)}>
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <span className="">Notate</span>
            </Link>
          </div>

          <ScrollArea className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                    pathname === item.href && "bg-muted text-primary"
                  )}
                >
                  <span>{item.title}</span>
                </Link>
              ))}
            </nav>
          </ScrollArea>

          <div className="mt-auto p-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                localStorage.removeItem('authToken');
                window.location.href = '/login';
              }}
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
