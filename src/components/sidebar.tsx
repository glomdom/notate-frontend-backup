"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/app-provider";
import { LayoutDashboard, Users, Library, ClipboardList, Menu, GraduationCap } from "lucide-react";

const teacherNav = [
  { title: "Dashboard", href: "/dashboard/teacher", icon: <LayoutDashboard size={18} /> },
  { title: "Subjects", href: "/dashboard/teacher/subjects", icon: <Users size={18} /> },
  { title: "Assignments", href: "/dashboard/teacher/assignments", icon: <Library size={18} /> },
  { title: "Gradebook", href: "/dashboard/teacher/gradebook", icon: <ClipboardList size={18} /> },
];

const studentNav = [
  { title: "Dashboard", href: "/dashboard/student", icon: <LayoutDashboard size={18} /> },
  { title: "Submissions", href: "/dashboard/student/submissions", icon: <ClipboardList size={18} /> },
];

const adminNav = [
  { title: "Dashboard", href: "/dashboard/admin", icon: <LayoutDashboard size={18} /> },
  { title: "Curriculum", href: "/dashboard/admin/curriculum", icon: <GraduationCap size={18} /> },
  { title: "Users", href: "/dashboard/admin/users", icon: <Users size={18} /> },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navItems = () => {
    switch (user?.role) {
      case "admin": return adminNav;
      case "teacher": return teacherNav;
      case "student": return studentNav;
      default: return [];
    }
  };

  if (!user?.role) return null;

  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col">
          <nav className="grid gap-2 text-lg font-medium">
            {navItems().map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                  pathname === item.href && "bg-muted text-primary"
                )}
              >
                {item.icon}
                <span>{item.title}</span>
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className={cn("hidden border-r bg-muted/40 md:block")}>
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <span className="">Notate</span>
            </Link>
          </div>

          <ScrollArea className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              {navItems().map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                    pathname === item.href && "bg-muted text-primary"
                  )}
                >
                  {item.icon}
                  <span>{item.title}</span>
                </Link>
              ))}
            </nav>
          </ScrollArea>

          <div className="mt-auto p-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={logout}
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
