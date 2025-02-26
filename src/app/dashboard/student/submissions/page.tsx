"use client";

import { useEffect, useState, ChangeEvent } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Submission } from "@/lib/types";
import { api } from "@/lib/api-client";

export default function StudentSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState("all");

  useEffect(() => {
    async function fetchData() {
      const response = await api.get<Submission[]>("/api/submission/submissions/me");
      console.log(response.data);
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

      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `submission-${submissionId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Download error:", error);
    }
  };

  const courses = Array.from(new Set(submissions.map((sub) => sub.courseName)));
  const filteredSubmissions =
    selectedCourse === "all"
      ? submissions
      : submissions.filter((sub) => sub.courseName === selectedCourse);

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold">Your Submissions</h1>

      {/* Course filter */}
      <div>
        <label htmlFor="courseFilter" className="mr-2 text-sm font-medium">
          Filter by Course:
        </label>
        <select
          id="courseFilter"
          value={selectedCourse}
          key={selectedCourse}
          onChange={(e: ChangeEvent<HTMLSelectElement>) =>
            setSelectedCourse(e.target.value)
          }
          className="p-2 border rounded"
        >
          <option value="all">All Courses</option>
          {courses.map((course) => (
            <option key={course} value={course}>
              {course}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p>Loading submissions...</p>
      ) : filteredSubmissions.length === 0 ? (
        <p>No submissions found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSubmissions.map((submission) => (
            <Card key={submission.id} className="shadow-md rounded-lg p-4">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  {submission.assignmentTitle}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Submitted on:{" "}
                  {new Date(submission.submittedAt).toLocaleDateString()}
                </p>
                <p className="text-sm font-medium">
                  {submission.grade === null
                    ? "Not graded yet."
                    : `Grade: ${submission.grade}%`}
                </p>
                {submission.feedbackComment && (
                  <div className="mt-2 p-2 bg-gray-100 rounded">
                    <h4 className="font-semibold text-sm">Feedback:</h4>
                    <p className="text-sm">{submission.feedbackComment}</p>
                  </div>
                )}
                <Button
                  onClick={() => handleDownload(submission.id)}
                  className="mt-4 w-full"
                >
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
