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

export interface Subject {
  id: string;
  name: string;
  teacherIds: string[];
  classes: Class[];
  subjectAssignments: SubjectAssignment[];
}

export interface Class {
  id: string;
  name: string;
  studentIds: string[];
}

export interface SubjectAssignment {
  id: string;
  subjectId: string;
  studentIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface JwtPayload {
  role: string;
  id: string;
}
