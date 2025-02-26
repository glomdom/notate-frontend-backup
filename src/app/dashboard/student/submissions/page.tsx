"use client";

import { useEffect, useState, ChangeEvent } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Submission } from "@/lib/types";
import { api } from "@/lib/api-client";
import { CalendarDays, Download, FileWarning, GraduationCap, Loader2, MessageSquareText } from "lucide-react";

export default function StudentSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState("all");

  useEffect(() => {
    async function fetchData() {
      const response = await api.get<Submission[]>("/api/submission/submissions/me");

      if (response.error) {
        console.error("Error fetching submissions:", response.error);
      } else if (response.data) {
        setSubmissions(response.data);
      }

      setLoading(false);
    }

    fetchData();
  }, []);

  const handleDownload = async (submissionId: string) => {
    try {
      const response = await api.getBlob(`/api/submission/submissions/${submissionId}/file`);
      if (response.error) throw new Error(response.error);

      const { blob, fileName } = response.data!;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Download error:", error);
    }
  };

  const courses = Array.from(new Set(submissions.map((sub) => sub.subjectName)));
  const filteredSubmissions =
    selectedCourse === "all"
      ? submissions
      : submissions.filter((sub) => sub.subjectName === selectedCourse);

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-4xl font-bold">
          Your Submissions
        </h1>

        <div className="flex items-center gap-2">
          <label htmlFor="courseFilter" className="text-sm font-medium text-muted-foreground">
            Filter by Course:
          </label>
          <select
            id="courseFilter"
            value={selectedCourse}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => setSelectedCourse(e.target.value)}
            className="px-4 py-2 border rounded-full bg-background hover:bg-accent/50 transition-colors focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            <option value="all">All Courses</option>
            {courses.map((course, index) => (
              <option key={`course-${course}-${index}`} value={course}>
                {course}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredSubmissions.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
          <FileWarning className="h-12 w-12 mb-4" />
          <p className="text-lg">No submissions found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSubmissions.map((submission, index) => (
            <Card
              key={submission.id || `submission-${index}`}
              className="group relative overflow-hidden hover:shadow-lg transition-shadow duration-300 border bg-gradient-to-r from-accent/10 to-background border-accent/30 hover:border-primary/20"
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-bold tracking-tight">
                  {submission.assignmentTitle}
                  <span className="block text-sm font-medium text-primary mt-1">
                    {submission.subjectName}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {new Date(submission.submittedAt).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>

                  <div className={`flex items-center gap-2 text-lg ${submission.grade === null ? 'text-muted-foreground' : 'text-green-600'
                    }`}>
                    <GraduationCap className="h-5 w-5" />
                    <span>
                      {submission.grade === null ? 'Pending Grade' : `Grade: ${submission.grade}`}
                    </span>
                  </div>

                  {submission.feedbackComment && (
                    <div className="mt-2 p-3 bg-accent/10 rounded-lg border-l-4 border-primary">
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <MessageSquareText className="h-4 w-4" />
                        <span>Instructor Feedback</span>
                      </div>
                      <p className="mt-1 text-sm">{submission.feedbackComment}</p>
                    </div>
                  )}
                </div>

                <Button
                  onClick={() => handleDownload(submission.id)}
                  variant="outline"
                  className="w-full mt-6 hover:bg-primary/10 hover:text-primary border-accent/30 group/download"
                >
                  <Download className="h-4 w-4 mr-2 transition-transform group-hover/download:-translate-y-0.5" />
                  Download Submission
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
