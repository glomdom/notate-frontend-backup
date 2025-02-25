"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Notebook, Upload, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Assignment } from "@/lib/types";

export default function StudentDashboard() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const activeCoursesCount = new Set(assignments.map(a => a.subjectId)).size;
  const activeAssignments = assignments.filter(a => !a.submissions || a.submissions.length === 0);
  const submittedAssignments = assignments.filter(a => a.submissions && a.submissions.length > 0);

  const gradedSubmissions = assignments.flatMap(a =>
    a.submissions?.filter(sub => typeof sub.grade === 'number') || []
  );
  const averageGrade = gradedSubmissions.length > 0
    ? gradedSubmissions.reduce((sum, sub) => sum + (sub.grade || 0), 0) / gradedSubmissions.length
    : null;

  const now = new Date();
  const upcomingCount = activeAssignments.filter(a => {
    const dueDate = new Date(a.dueDate);
    return dueDate > now && dueDate <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  }).length;

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const res = await fetch('http://localhost:4000/api/submission/student/assignments', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`
          }
        });

        if (!res.ok) throw new Error('Failed to fetch assignments');
        const data = await res.json();
        setAssignments(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, []);

  const handleSubmission = async () => {
    if (!selectedAssignment || !file) return;
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('assignmentId', selectedAssignment.id);
      formData.append('file', file);

      const uploadResponse = await fetch('http://localhost:4000/api/submission/submissions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`
        },
        body: formData,
      });

      if (!uploadResponse.ok) throw new Error('Submission failed');

      setAssignments(prev =>
        prev.map(a =>
          a.id === selectedAssignment.id
            ? {
              ...a,
              submissions: [{
                fileUrl: URL.createObjectURL(file),
                createdAt: new Date().toISOString(),
              }]
            }
            : a
        )
      );

      setDialogOpen(false);
      setFile(null);
    } catch (error) {
      console.error('Submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 p-6">
      <h1 className="text-3xl font-bold">Student Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Enrollments</CardTitle>
            <Notebook className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCoursesCount}</div>
            <p className="text-xs text-muted-foreground">Enrolled subjects</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Submissions</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeAssignments.length}</div>
            <p className="text-xs text-muted-foreground">Assignments due</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Recent Grades</CardTitle>
            <Upload className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {averageGrade !== null ? `${Math.round(averageGrade)}%` : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">Average score</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingCount}</div>
            <p className="text-xs text-muted-foreground">Deadlines this week</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="flex-1">
          <CardHeader>
            <CardTitle className="text-xl">Active Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">Loading assignments...</div>
            ) : activeAssignments.length > 0 ? (
              <div className={`space-y-4 ${activeAssignments.length > 5 ? "max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400" : ""}`}>
                {activeAssignments.map((assignment) => (
                  <div key={assignment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{assignment.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        Due: {new Date(assignment.dueDate).toLocaleDateString()}
                        {new Date(assignment.dueDate) < new Date() && (
                          <span className="text-red-500 ml-2">(Late)</span>
                        )}
                      </p>
                    </div>

                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => setSelectedAssignment(assignment)}
                        >
                          Submit Now
                        </Button>
                      </DialogTrigger>

                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{assignment.title} Submission</DialogTitle>
                          <DialogDescription>
                            Due {new Date(assignment.dueDate).toLocaleDateString()}
                          </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="file" className="text-right">
                              File
                            </Label>
                            <Input
                              id="file"
                              type="file"
                              className="col-span-3"
                              onChange={(e) => {
                                const input = e.target as HTMLInputElement;
                                setFile(input.files?.[0] || null);
                              }}
                            />
                          </div>
                        </div>

                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setDialogOpen(false);
                              setFile(null);
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleSubmission}
                            disabled={!file || isSubmitting}
                          >
                            {isSubmitting ? 'Submitting...' : 'Submit Assignment'}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">No active assignments</div>
            )}
          </CardContent>
        </Card>

        {/* Submitted Assignments */}
        <Card className="flex-1">
          <CardHeader>
            <CardTitle className="text-xl">Submitted Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">Loading submissions...</div>
            ) : submittedAssignments.length > 0 ? (
              <div className={`space-y-4 ${submittedAssignments.length > 5 ? "max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400" : ""}`}>
                {submittedAssignments.map((assignment) => (
                  <div key={assignment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{assignment.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        Submitted: {assignment.submissions?.[0]?.createdAt &&
                          new Date(assignment.submissions[0].createdAt).toLocaleDateString()}
                      </p>
                      {new Date(assignment.dueDate) < new Date(assignment.submissions?.[0]?.createdAt || 0) && (
                        <p className="text-xs text-red-500 mt-1">Submitted late</p>
                      )}
                    </div>

                    <Button variant="outline" size="sm" disabled>
                      Submitted
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">No submissions yet</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
