export interface TaskComment {
  id?: string;
  taskId: string;
  userId: string;
  userName?: string;
  message: string;
  isWorkUpdate: boolean;
  createdAt: number;
}
