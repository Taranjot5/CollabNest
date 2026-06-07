export interface Comment {

  id?: string;

  noteId: string;

  workspaceId: string;

  userId: string;

  userName: string;

  message: string;

  createdAt: number;

  updatedAt?: number;
}