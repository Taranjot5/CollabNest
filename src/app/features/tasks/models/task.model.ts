import { Attachment } from '../../notes/models/attachment.model';

export type TaskStatus =
  | 'pending'
  | 'in_progress'
  | 'under_review'
  | 'completed';

export type TaskPriority = 'High' | 'Medium' | 'Low';

export interface CompletionReport {
  text: string;
  submittedAt: number;
  submittedBy: string;
  attachments?: Attachment[];
}

export interface TaskReview {
  status: 'approved' | 'rejected' | 'changes_requested';
  reviewedBy: string;
  reviewedAt: number;
  notes: string;
}

export interface Task {
  id?: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: number;
  progressPercent: number;
  createdBy: string;
  createdByName?: string;
  assigneeIds: string[];
  assigneeNames?: string[];
  participants: string[];
  workspaceId?: string;
  attachments?: Attachment[];
  completionReport?: CompletionReport;
  lastReview?: TaskReview;
  createdAt: number;
  updatedAt: number;
}
