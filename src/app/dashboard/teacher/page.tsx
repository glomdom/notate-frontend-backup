"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Home,
  Users,
  Library,
  TrendingUp,
} from "lucide-react";

export default function TeacherDashboard() {
  const [classesCount, setClassesCount] = useState<number>(0);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [pendingAssignments, setPendingAssignments] = useState<number>(0);
  const [averageGrade, setAverageGrade] = useState<number>(0);
  const [sumOfGrades, setSumOfGrades] = useState<number>(0);
  const [totalGrades, setTotalGrades] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const authToken = localStorage.getItem("authToken");

        const [classesResponse, subjectsResponse, assignmentsResponse] = await Promise.all([
          fetch("http://localhost:4000/api/class/classes", { headers: { Authorization: `Bearer ${authToken}` } }),
          fetch("http://localhost:4000/api/class/subjects", { headers: { Authorization: `Bearer ${authToken}` } }),
          fetch("http://localhost:4000/api/submission/assignments/my-assignments", { headers: { Authorization: `Bearer ${authToken}` } }),
        ]);

        if (!classesResponse.ok || !subjectsResponse.ok || !assignmentsResponse.ok) {
          throw new Error("Failed to fetch data");
        }

        const classesData = await classesResponse.json();
        const subjectsData = await subjectsResponse.json();
        const assignmentsData = await assignmentsResponse.json();

        const totalUngraded = assignmentsData.reduce(
          (acc: number, assignment: any) => acc + assignment.ungradedCount,
          0
        );

        setClassesCount(classesData.length);
        setSubjects(subjectsData);
        setPendingAssignments(totalUngraded);


        assignmentsData.forEach(async (assignment) => {
          const assignmentId = assignment.id;
          const submissionResponse = await fetch(`http://localhost:4000/api/submission/submissions/for-assignment/${assignmentId}`, { headers: { Authorization: `Bearer ${authToken}` } });

          if (!submissionResponse.ok) {
            throw new Error("Failed to fetch data");
          }

          const submissionData = await submissionResponse.json();

          

          submissionData.forEach(submission => {
            if (submission.grade) {
              setSumOfGrades(prev => prev + submission.grade);
              setTotalGrades(prev => prev + 1);
            }
          })
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (totalGrades > 0) {
      setAverageGrade(sumOfGrades / totalGrades);
    }
  }, [sumOfGrades, totalGrades]);

  return (
    <div className="flex h-screen">
      {/* Main Dashboard Content */}
      <main className="flex-1 p-6 space-y-6 overflow-y-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
        </div>

        {/* Dashboard Cards */}
        {loading ? (
          <p>Loading data...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Classes Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Classes</CardTitle>
                <Home className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{classesCount}</div>
                <p className="text-xs text-muted-foreground">Total classes</p>
              </CardContent>
            </Card>

            {/* Subjects Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Subjects</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{subjects.length}</div>
                <p className="text-xs text-muted-foreground">Subjects taught</p>
              </CardContent>
            </Card>

            {/* Assignments Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Assignments</CardTitle>
                <Library className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingAssignments}</div>
                <p className="text-xs text-muted-foreground">Ungraded assignments</p>
              </CardContent>
            </Card>

            {/* Overall Average Grade Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Overall Average</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{String(averageGrade)}</div>
                <p className="text-xs text-muted-foreground">Overall grade average</p>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
