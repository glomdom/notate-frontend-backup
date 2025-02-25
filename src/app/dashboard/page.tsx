"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '@/lib/types';

export default function Dashboard() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('authToken');

    if (!token) {
      router.push('/login');

      return;
    }

    try {
      const decoded = jwt.decode(token) as JwtPayload;

      switch (decoded?.role) {
        case 'admin':
          router.push('/dashboard/admin');
          break;

        case 'teacher':
          router.push('/dashboard/teacher');
          break;

        case 'student':
          router.push('/dashboard/student')
          break;

        default:
          throw new Error('Invalid role');
      }
    } catch (error) {
      localStorage.removeItem('authToken');

      router.push('/login');
    }
  }, [router]);

  return <div className="p-8">Loading dashboard...</div>;
}
