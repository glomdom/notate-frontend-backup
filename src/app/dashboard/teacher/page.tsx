"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Home,
  Users,
  Library,
  TrendingUp,
  PlusCircle,
} from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function TeacherDashboard() {
  // Dashboard metrics
  const [classesCount, setClassesCount] = useState<number>(0);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [pendingAssignments, setPendingAssignments] = useState<number>(0);
  const [averageGrade, setAverageGrade] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // State to control the floating "Create Assignment" dialog
  const [dialogOpen, setDialogOpen] = useState(false);

  // Form state for new assignment
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [createdAssignment, setCreatedAssignment] = useState<any>(null);

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

        console.log(assignmentsData);

        setAverageGrade(87);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError("");
    try {
      const authToken = localStorage.getItem("authToken");
      const res = await fetch("http://localhost:4000/api/submission/assignments/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          title,
          description,
          dueDate,
          subjectId,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        setFormError(errorData.error || "Failed to create assignment");
      } else {
        const data = await res.json();
        setCreatedAssignment(data);
        // Reset form fields
        setTitle("");
        setDescription("");
        setDueDate("");
        setSubjectId("");
      }
    } catch (err) {
      setFormError("An error occurred. Please try again.");
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Main Dashboard Content */}
      <main className="flex-1 p-6 space-y-6 overflow-y-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <button className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors">
                <PlusCircle size={18} />
                Create Assignment
              </button>
            </DialogTrigger>
            <DialogContent className="fixed top-1/2 left-1/2 z-50 w-full max-w-md p-6 rounded-lg shadow-lg transform -translate-x-1/2 -translate-y-1/2">
              <DialogHeader>
                <DialogTitle>Create New Assignment</DialogTitle>
                <DialogDescription>
                  Fill in the details below to create a new assignment.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateAssignment} className="space-y-4 mt-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Title
                  </label>
                  <Input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="mt-1"
                  />
                </div>
                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    className="mt-1 block w-full border rounded-md p-2"
                  ></textarea>
                </div>
                {/* Due Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Due Date
                  </label>
                  <Input
                    type="datetime-local"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    required
                    className="mt-1"
                  />
                </div>
                {/* Subject Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Subject
                  </label>
                  <select
                    value={subjectId}
                    onChange={(e) => setSubjectId(e.target.value)}
                    required
                    className="mt-1 block w-full border rounded-md p-2"
                  >
                    <option value="">Select a subject</option>
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                </div>
                {formError && <p className="text-red-500">{formError}</p>}
                <button
                  type="submit"
                  disabled={formLoading}
                  className="bg-blue-500 hover:bg-blue-600 transition-colors text-white px-4 py-2 rounded-md"
                >
                  {formLoading ? "Creating..." : "Create Assignment"}
                </button>
              </form>
              {createdAssignment && (
                <div className="mt-4 p-4 border rounded-md">
                  <h3 className="font-bold text-green-500">Assignment Created Successfully!</h3>
                  <div className="mt-2 space-y-1">
                    <p>
                      <span className="font-medium">Title:</span> {createdAssignment.title}
                    </p>
                    <p>
                      <span className="font-medium">Description:</span> {createdAssignment.description}
                    </p>
                    <p>
                      <span className="font-medium">Due Date:</span>{" "}
                      {new Date(createdAssignment.dueDate).toLocaleString()}
                    </p>
                    {createdAssignment.subject && (
                      <p>
                        <span className="font-medium">Subject:</span> {createdAssignment.subject.name}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
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
                <div className="text-2xl font-bold">{averageGrade}%</div>
                <p className="text-xs text-muted-foreground">Overall grade average</p>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
