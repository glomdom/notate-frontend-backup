"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { format, isValid } from "date-fns";
import { Submission } from "@/lib/types";

type Assignment = {
  id: string;
  title: string;
  dueDate: string;
  subjectId: string;
  submissionsCount: number;
  ungradedCount: number;
};

type Subject = {
  id: string;
  name: string;
};

type Student = {
  id: string;
  firstName: string;
  lastName: string;
};

export default function GradebookPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [gradeInputs, setGradeInputs] = useState<
    Record<string, { grade: string; comment: string }>
  >({});

  const { data: assignmentsData, isLoading: assignmentsLoading } = useQuery<Assignment[]>({
    queryKey: ["teacherAssignments"],
    queryFn: async () => {
      const res = await api.get<Assignment[]>("/api/submission/assignments/my-assignments");
      return res.data || [];
    },
  });

  const { data: subjectsData } = useQuery<Subject[]>({
    queryKey: ["teacherSubjects"],
    queryFn: async () => {
      const res = await api.get<Subject[]>("/api/class/subjects");
      return res.data || [];
    },
  });

  const subjectsMap = useMemo(() => {
    const map = new Map<string, string>();
    subjectsData?.forEach((subj) => {
      map.set(subj.id, subj.name);
    });

    return map;
  }, [subjectsData]);

  const { data: studentsData } = useQuery<Student[]>({
    queryKey: ["students"],
    queryFn: async () => {
      const res = await api.get<Student[]>("/api/auth/users?role=student");
      return res.data || [];
    },
  });

  const studentsMap = useMemo(() => {
    const map = new Map<string, string>();
    studentsData?.forEach((student) => {
      map.set(student.id, `${student.firstName} ${student.lastName}`);
    });

    return map;
  }, [studentsData]);

  const {
    data: submissionsData,
    isLoading: submissionsLoading,
  } = useQuery<Submission[]>({
    queryKey: ["assignmentSubmissions", selectedAssignment?.id],
    queryFn: async () => {
      if (!selectedAssignment) return [];
      const res = await api.get<Submission[]>(
        `/api/submission/submissions/for-assignment/${selectedAssignment.id}`
      );
      return res.data || [];
    },
    enabled: !!selectedAssignment,
  });

  // Mutation for grading a submission.
  const gradeMutation = useMutation({
    mutationFn: async ({
      submissionId,
      grade,
      comment,
    }: {
      submissionId: string;
      grade: number;
      comment: string;
    }) => {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`http://localhost:4000/api/submission/submissions/${submissionId}/grade`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ grade, comment }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to grade submission");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Submission graded" });
      queryClient.invalidateQueries({
        queryKey: ["assignmentSubmissions", selectedAssignment?.id],
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Grading failed",
        description: error.message,
      });
    },
  });

  const handleGradeChange = (
    submissionId: string,
    field: "grade" | "comment",
    value: string
  ) => {
    setGradeInputs((prev) => ({
      ...prev,
      [submissionId]: { grade: "", comment: "", ...prev[submissionId], [field]: value },
    }));
  };

  const handleGradeSubmit = (submissionId: string) => {
    const { grade, comment } = gradeInputs[submissionId] || { grade: "", comment: "" };
    const parsedGrade = Number(grade);
    if (isNaN(parsedGrade)) {
      toast({
        variant: "destructive",
        title: "Invalid grade",
        description: "Grade must be a number.",
      });
      return;
    }
    gradeMutation.mutate({ submissionId, grade: parsedGrade, comment });
  };

  // Helper to safely format dates.
  const safeFormatDate = (dateStr: string, dateFormat: string) => {
    const dateObj = new Date(dateStr);
    return isValid(dateObj) ? format(dateObj, dateFormat) : "Invalid Date";
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Gradebook</h1>
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column: Teacher Assignments List */}
        <div className="lg:w-1/3 space-y-4">
          <h2 className="text-xl font-semibold">Your Assignments</h2>
          {assignmentsLoading ? (
            <p>Loading assignments...</p>
          ) : assignmentsData && assignmentsData.length === 0 ? (
            <p>No assignments found.</p>
          ) : (
            assignmentsData?.map((assignment) => {
              const subjectName = subjectsMap.get(assignment.subjectId) || "Unknown Subject";
              return (
                <Card
                  key={assignment.id}
                  className={`cursor-pointer border p-4 hover:shadow-lg ${
                    selectedAssignment?.id === assignment.id ? "bg-muted/20" : ""
                  }`}
                  onClick={() => setSelectedAssignment(assignment)}
                >
                  <div className="flex flex-col space-y-2">
                    <p className="font-bold">{assignment.title}</p>
                    <span className="text-sm text-muted-foreground">{subjectName}</span>
                    <p className="text-sm">
                      Due: {safeFormatDate(assignment.dueDate, "MMM d, yyyy h:mm a")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Submissions: {assignment.submissionsCount} (Ungraded:{" "}
                      {assignment.ungradedCount})
                    </p>
                  </div>
                </Card>
              );
            })
          )}
        </div>

        {/* Right Column: Submissions Table */}
        <div className="lg:w-2/3">
          {selectedAssignment ? (
            <>
              <h2 className="text-xl font-semibold p-4">
                Submissions
              </h2>
              {submissionsLoading ? (
                <p>Loading submissions...</p>
              ) : submissionsData && submissionsData.length === 0 ? (
                <p>No submissions found for this assignment.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-400">
                    <thead className="">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">
                          Student
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">
                          Submitted At
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">
                          Grade
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {submissionsData?.map((submission) => (
                        <tr key={submission.id}>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">
                            {studentsMap.get(submission.studentId) || submission.studentId}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">
                            {safeFormatDate(
                              submission.submittedAt,
                              "MMM d, yyyy h:mm a"
                            )}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">
                            {submission.grade !== null ? (
                              submission.grade
                            ) : (
                              <div className="flex flex-col space-y-1">
                                <Input
                                  placeholder="Grade"
                                  value={gradeInputs[submission.id]?.grade || ""}
                                  onChange={(e) =>
                                    handleGradeChange(submission.id, "grade", e.target.value)
                                  }
                                  className="w-20 text-sm"
                                />
                                <Input
                                  placeholder="Comment"
                                  value={gradeInputs[submission.id]?.comment || ""}
                                  onChange={(e) =>
                                    handleGradeChange(submission.id, "comment", e.target.value)
                                  }
                                  className="w-full text-sm"
                                />
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">
                            <div className="flex flex-col gap-2">
                              {submission.grade === null && (
                                <Button
                                  size="sm"
                                  onClick={() => handleGradeSubmit(submission.id)}
                                  disabled={gradeMutation.isPending}
                                >
                                  {gradeMutation.isPending ? "Submitting" : "Submit Grade"}
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  window.open(
                                    `http://localhost:4000/api/submission/submissions/${submission.id}/file`,
                                    "_blank"
                                  )
                                }
                              >
                                Download
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          ) : (
            <p className="text-lg text-muted-foreground">
              Please select an assignment to view its submissions.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
