"use client";

import { cn } from "@/lib/utils";
import { format, isValid } from "date-fns";
import { CalendarDays, AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Assignment } from "@/lib/types";

interface AssignmentCardProps {
  assignment: Assignment;
  variant?: "active" | "submitted";
  onSelect?: () => void;
}

export function AssignmentCard({ assignment, variant = "active", onSelect }: AssignmentCardProps) {
  // Safe date parsing with validation
  const dueDate = new Date(assignment.dueDate);
  const isDueDateValid = isValid(dueDate);

  // Submission date handling
  const submissionDate = assignment.submissions?.[0]?.createdAt
    ? new Date(assignment.submissions[0].createdAt)
    : null;
  const isSubmissionValid = submissionDate && isValid(submissionDate);

  // Date comparison
  const isLate = isDueDateValid && dueDate < new Date();

  return (
    <div className={cn(
      "border rounded-lg p-4 transition-colors",
      variant === "active" && "hover:border-primary/20",
      variant === "submitted" && "opacity-75"
    )}>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h3 className="font-medium">{assignment.title}</h3>

          {isDueDateValid && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarDays className="h-4 w-4" />
              <span>
                Due: {format(dueDate, "MMM d, yyyy")}
                {isLate && variant === "active" && (
                  <span className="text-destructive ml-2">
                    <AlertTriangle className="h-4 w-4 inline mr-1" />
                    Late
                  </span>
                )}
              </span>
            </div>
          )}

          {isSubmissionValid && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Submitted: {format(submissionDate, "MMM d, yyyy")}</span>
            </div>
          )}
        </div>

        {variant === "active" && (
          <Button size="sm" onClick={onSelect}>
            Submit Now
          </Button>
        )}
      </div>
    </div>
  );
}

AssignmentCard.Skeleton = function AssignmentCardSkeleton({ count = 1 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-[88px] w-full rounded-lg" />
      ))}
    </>
  );
};
