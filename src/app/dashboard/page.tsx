"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/app-provider';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user?.role) {
      console.log(user);
      router.push('/login');
      return;
    }

    switch (user?.role) {
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
  }, [loading, user?.role, router]);

  return <div className="p-8">Loading dashboard...</div>;
}
