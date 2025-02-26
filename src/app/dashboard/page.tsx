"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/app-provider';

export default function DashboardPage() {
  const router = useRouter();
  const { role } = useAuth();

  useEffect(() => {
    if (!role) {
      router.push('/login');
      return;
    }

    switch (role) {
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
  }, [role, router]);

  return <div className="p-8">Loading dashboard...</div>;
}
