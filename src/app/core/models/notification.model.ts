export interface Notification {

  id?: string;

  userId: string;

  workspaceId: string;

  title: string;

  message: string;

  isRead: boolean;

  createdAt: number;
}