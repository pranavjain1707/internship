/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = "Employee" | "Manager" | "HR Officer" | "IT Administrator" | "Owner";

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  Employee: 1,
  Manager: 2,
  "HR Officer": 3,
  "IT Administrator": 4,
  Owner: 5,
};

export interface PendingApprovalRequest {
  id: string;
  name: string;
  domain: string;
  role: UserRole;
  sponsorName: string;
  status: "pending" | "approved" | "rejected";
  approvedBy?: string;
  createdAt: string;
}

export interface PendingKickRequest {
  id: string;
  targetUserId: string;
  targetUserName: string;
  targetUserRole: UserRole;
  requestedBy: string;
  requestedByRole: UserRole;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface PendingProfileRequest {
  id: string;
  userId: string;
  userName: string;
  requestedName?: string;
  requestedEmail: string;
  requestedPassword?: string;
  requestedByRole: UserRole;
  sponsorName: string;
  status: "pending" | "approved" | "rejected";
  approvedBy?: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface Document {
  id: string;
  name: string;
  category: string;
  content: string;
  dateUploaded: string;
  uploadedBy: string;
  fileType: "pdf" | "docx" | "pptx" | "txt";
  size: string;
}

export interface Citation {
  sourceDoc: string;
  page?: string;
  section?: string;
  snippet?: string;
}

export interface QueryLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  queryText: string;
  responseText: string;
  citations: Citation[];
  timestamp: string;
  status: "success" | "failed";
  feedback?: {
    rating: "like" | "dislike";
    comments?: string;
  };
}

export interface SystemFeedback {
  id: string;
  queryId: string;
  userId: string;
  userName: string;
  rating: "like" | "dislike";
  comments?: string;
  timestamp: string;
}

export interface AnalyticsSummary {
  activeUsers: number;
  searchSuccessRate: number; // e.g. 92 (%)
  queryVolume: number;
  userSatisfaction: number; // e.g. 88 (%)
  dailyUsage: { date: string; count: number }[];
  responseAccuracy: { range: string; value: number }[];
  topSearchedTopics: { topic: string; count: number }[];
}
