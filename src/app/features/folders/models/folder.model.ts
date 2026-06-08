export interface Folder {

  id?: string;

  name: string;

  workspaceId: string;

  parentId?: string | null;

  createdBy: string;

  createdAt: number;

  updatedAt?: number;

  isPinned?: boolean;

  color?: string;

  sortOrder?: number;
}
