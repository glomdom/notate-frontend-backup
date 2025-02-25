"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Submission } from "@/lib/types";

export default function StudentSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const authToken = localStorage.getItem("authToken");
        const [submissionsResponse] = await Promise.all([
          fetch("http://localhost:4000/api/submission/submissions/me", {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }),
        ]);

        if (!submissionsResponse.ok) {
          throw new Error("Failed to fetch submissions");
        }

        const submissionsData = await submissionsResponse.json();
        setSubmissions(submissionsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleDownload = async (submissionId: string) => {
    try {
      const authToken = localStorage.getItem("authToken");
      const response = await fetch(`http://localhost:4000/api/submission/submissions/${submissionId}/file`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!response.ok) throw new Error("Download failed");

      console.log(response.headers);
      const contentDisposition = response.headers.get("content-disposition");
      const blob = await response.blob();
      let extension = ".jpg";

      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (fileNameMatch && fileNameMatch[1]) {
          const originalFilename = fileNameMatch[1];
          const dotIndex = originalFilename.lastIndexOf(".");
          if (dotIndex !== -1) {
            extension = originalFilename.substring(dotIndex);
          }
        }
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `submission-${submissionId}${extension}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Download error:", error);
    }
  };

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold">Your Submissions</h1>
      {loading ? (
        <p>Loading submissions...</p>
      ) : submissions.length === 0 ? (
        <p>No submissions found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {submissions.map((submission) => {
            return (
              <Card key={submission.id} className="mb-4">
                <CardHeader>
                  <CardTitle>{submission.assignmentTitle}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    Submitted on: {new Date(submission.submittedAt).toLocaleDateString()}
                  </p>
                  <p>
                    {submission.grade === null
                      ? "Not graded yet."
                      : "Grade: " + submission.grade + "%"}
                  </p>
                  {submission.feedbackComment && submission.feedbackComment.length > 0 && (
                    <div className="mt-2">
                      <h4 className="font-semibold">Feedback:</h4>
                      <ul className="list-disc list-inside">
                        <li>{submission.feedbackComment}</li>
                      </ul>
                    </div>
                  )}
                  <Button onClick={() => handleDownload(submission.id)} className="mt-4">
                    Download Submission
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
