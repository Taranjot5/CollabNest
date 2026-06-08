export interface TaskActivity {
  id?: string;
  taskId: string;
  userId: string;
  userName?: string;
  action: string;
  message: string;
  metadata?: Record<string, unknown>;
  createdAt: number;
}
