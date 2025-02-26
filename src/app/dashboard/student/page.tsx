"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Users,
  TrendingUp,
  Calendar,
  AlertTriangle,
  BookOpenCheck,
  FileUp,
  Clock
} from "lucide-react";
import { isBefore, isWithinInterval, addDays, isValid } from "date-fns";
import { Assignment, Submission, ApiResponse } from "@/lib/types";
import { api } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";
import { AssignmentCard } from "@/components/cards/assignment-card";
import { StatsGrid } from "@/components/sections/stats-grid";
import { SubmissionDialog } from "@/components/dialogs/submission-dialog";

export default function StudentDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);

  // Fetch assignments with proper error handling
  const { data: assignmentsResponse } = useQuery<ApiResponse<Assignment[]>>({
    queryKey: ["student-assignments"],
    queryFn: () => api.get("/api/submission/student/assignments"),
  });

  // Handle API response
  const assignments = assignmentsResponse?.data || [];
  const assignmentsError = assignmentsResponse?.error;

  // File submission mutation
  const { mutate: submitAssignment, isPending: isSubmitting } = useMutation({
    mutationFn: async ({ assignmentId, file }: { assignmentId: string; file: File }) => {
      const formData = new FormData();
      formData.append("assignmentId", assignmentId);
      formData.append("file", file);

      const response = await api.upload<Submission>("/api/submission/submissions", formData);
      if (response.error) throw new Error(response.error);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-assignments"] });
      setSelectedAssignment(null);
      toast({
        title: "✅ Submission Successful",
        description: "Your work has been submitted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "❌ Submission Failed",
        description: error.message,
      });
    },
  });

  // Memoized dashboard metrics
  const dashboardMetrics = useMemo(() => {
    const activeCourses = new Set(assignments.map(a => a.subjectId)).size;
    const activeAssignments = assignments.filter(a => !a.submissions?.length);
    const submittedAssignments = assignments.filter(a => a.submissions?.length);

    const upcomingCount = activeAssignments.filter(a => {
      const dueDate = new Date(a.dueDate);
      const now = new Date();

      return (
        isValid(dueDate) &&
        isWithinInterval(dueDate, { start: now, end: addDays(now, 7) }) &&
        isBefore(now, dueDate)
      );
    }).length;

    const averageGrade = submittedAssignments.length > 0
      ? submittedAssignments.reduce((acc, a) => {
        const grade = a.submissions?.[0]?.grade;
        if (grade === undefined) {
          return acc;
        }

        return acc + grade;
      }, 0) / submittedAssignments.length
      : null;

    console.log(submittedAssignments);

    return {
      activeCourses,
      activeAssignments,
      submittedAssignments,
      upcomingCount,
      averageGrade,
    };
  }, [assignments]);

  // Stats configuration
  const stats = [
    {
      title: "Enrollments",
      value: dashboardMetrics.activeCourses,
      icon: <Users className="h-4 w-4 text-muted-foreground" />,
      description: "Enrolled subjects",
    },
    {
      title: "Pending Submissions",
      value: dashboardMetrics.activeAssignments.length,
      icon: <FileUp className="h-4 w-4 text-muted-foreground" />,
      description: "Assignments due",
    },
    {
      title: "Average Grade",
      value: dashboardMetrics.averageGrade ? `${dashboardMetrics.averageGrade}` : "N/A",
      icon: <TrendingUp className="h-4 w-4 text-muted-foreground" />,
      description: "Overall average",
    },
    {
      title: "Upcoming",
      value: dashboardMetrics.upcomingCount,
      icon: <Calendar className="h-4 w-4 text-muted-foreground" />,
      description: "Deadlines this week",
    },
  ];

  // Render assignment sections
  const renderAssignmentSection = (title: string, assignments: Assignment[], variant: "active" | "submitted" = "active") => (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">{title}</h2>
      {assignmentsError ? (
        <div className="text-destructive text-center py-6">
          <AlertTriangle className="mx-auto h-6 w-6 mb-2" />
          Failed to load assignments: {assignmentsError}
        </div>
      ) : assignments.length === 0 ? (
        <div className="text-muted-foreground text-center py-6">
          <BookOpenCheck className="mx-auto h-6 w-6 mb-2" />
          {variant === "active" ? "No active assignments" : "No submissions yet"}
        </div>
      ) : (
        assignments.map(assignment => {
          const submission = assignment.submissions?.[0];
          const isLate = submission && isValid(new Date(submission.createdAt)) && isValid(new Date(assignment.dueDate)) && isBefore(new Date(assignment.dueDate), new Date(submission.createdAt));

          return (
            <div key={assignment.id} className="relative">
              <AssignmentCard
                assignment={assignment}
                variant={variant}
                onSelect={variant === "active" ? () => setSelectedAssignment(assignment) : undefined}
              />
              {isLate && (
                <div className="absolute top-4 right-4 flex items-center text-yellow-500">
                  <Clock className="h-5 w-5 mr-1" />
                  <span className="text-sm font-semibold">Late</span>
                </div>
              )}
            </div>
          );
        })
      )}
    </section>
  );

  return (
    <div>
      <StatsGrid stats={stats} />
      <div className="grid py-6 gap-6 md:grid-cols-2">
        {renderAssignmentSection("Active Assignments", dashboardMetrics.activeAssignments)}
        {renderAssignmentSection("Latest Submitted Assignments", dashboardMetrics.submittedAssignments, "submitted")}
      </div>
      <SubmissionDialog
        open={!!selectedAssignment}
        assignment={selectedAssignment}
        onOpenChange={(open) => !open && setSelectedAssignment(null)}
        onSubmit={(file) => {
          if (selectedAssignment) {
            submitAssignment({ assignmentId: selectedAssignment.id, file });
          }
        }}
        isLoading={isSubmitting}
      />
    </div>
  );
}
