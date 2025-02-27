"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/app-provider';
import { jwtDecode } from 'jwt-decode';
import { JwtPayload } from '@/lib/types';

export default function DashboardPage() {
  const router = useRouter();
  const { role, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    const token = jwtDecode<JwtPayload>(localStorage.getItem("authToken")!);

    if (!token.role) {
      router.push('/login');
      return;
    }

    switch (token.role) {
      case 'admin':
        router.push('/dashboard/admin');
        break;
      case 'teacher':
        router.push('/dashboard/teacher');
        break;
      case 'student':
        router.push('/dashboard/student');
        break;
      default:
        router.push('/login');
    }
  }, [role, isLoading, router]);

  return <div className="p-8">Loading dashboard...</div>;
}
