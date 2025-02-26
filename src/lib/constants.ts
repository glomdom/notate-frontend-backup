export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
export const ROLES = ["student", "teacher", "admin"] as const;
export type UserRole = typeof ROLES[number];
