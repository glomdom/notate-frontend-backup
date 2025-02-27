// internals
export type ApiResponse<T> =
  | { data: T; error?: never }
  | { data?: never; error: string };

export interface DashboardStats {
  enrollments: number;
  pendingSubmissions: number;
  averageGrade: number | null;
  upcomingDeadlines: number;
}

export interface UserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

// database models
export interface Submission {
  id: string;
  studentId: string;
  assignmentId: string;
  assignmentTitle: string;
  feedbackComment: string;
  fileUrl: string;
  createdAt: string;
  updatedAt: string;
  submittedAt: string;
  grade?: number;
  subjectName: string;
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
