"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Users, ClipboardList, School } from "lucide-react";

export default function DashboardAdminPage() {
  const [studentsCount, setStudentsCount] = useState<number>(0);
  const [teachersCount, setTeachersCount] = useState<number>(0);
  const [assignmentsCount, setAssignmentsCount] = useState<number>(0);
  const [classesCount, setClassesCount] = useState<number>(0);
  const [subjectsCount, setSubjectsCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const authToken = localStorage.getItem("authToken");

        // fetch students count
        const studentsRes = await fetch("http://localhost:4000/api/auth/users?role=student", {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        if (!studentsRes.ok) throw new Error("Failed to fetch students");
        const studentsData = await studentsRes.json();
        setStudentsCount(studentsData.length);

        // fetch teachers count
        const teachersRes = await fetch("http://localhost:4000/api/auth/users?role=teacher", {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        if (!teachersRes.ok) throw new Error("Failed to fetch teachers");
        const teachersData = await teachersRes.json();
        setTeachersCount(teachersData.length);

        // fetch assignments count (all assignments)
        const assignmentsRes = await fetch("http://localhost:4000/api/submission/assignments", {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        if (!assignmentsRes.ok) throw new Error("Failed to fetch assignments");
        const assignmentsData = await assignmentsRes.json();
        setAssignmentsCount(assignmentsData.length);

        // fetch classes count
        const classesRes = await fetch("http://localhost:4000/api/class/classes", {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        if (!classesRes.ok) throw new Error("Failed to fetch classes");
        const classesData = await classesRes.json();
        setClassesCount(classesData.length);

        // fetch subjects count
        const subjectsRes = await fetch("http://localhost:4000/api/class/subjects", {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        if (!subjectsRes.ok) throw new Error("Failed to fetch subjects");
        const subjectsData = await subjectsRes.json();
        setSubjectsCount(subjectsData.length);

      } catch (error) {
        console.error("Error fetching admin dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <p>Loading dashboard...</p>;

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Students Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentsCount}</div>
            <p className="text-xs text-muted-foreground">Total Students</p>
          </CardContent>
        </Card>

        {/* Teachers Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Teachers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teachersCount}</div>
            <p className="text-xs text-muted-foreground">Total Teachers</p>
          </CardContent>
        </Card>

        {/* Assignments Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Assignments</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assignmentsCount}</div>
            <p className="text-xs text-muted-foreground">Total Assignments</p>
          </CardContent>
        </Card>

        {/* Classes Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Classes</CardTitle>
            <School className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{classesCount}</div>
            <p className="text-xs text-muted-foreground">{subjectsCount} Subjects</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
