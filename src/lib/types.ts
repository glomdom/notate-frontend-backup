export interface Submission {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  feedbackComment: string;
  fileUrl: string;
  submittedAt: string;
  grade?: number;
}

export interface Assignment {
  id: string;
  title: string;
  dueDate: string;
  subjectId: string;
  submissions?: Submission[];
}

export interface JwtPayload {
  role: string;
  id: string;
}
