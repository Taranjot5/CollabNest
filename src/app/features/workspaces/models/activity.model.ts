export interface Activity {

  id?: string;

  workspaceId: string;

  userId: string;

  userName: string;

  action: string;

  target: string;

  createdAt: number;
}