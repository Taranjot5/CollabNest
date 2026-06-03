export interface Note {

  id?: string;

  title: string;

  content: string;

  category: string;

  priority: string;

  createdAt: number;

  updatedAt: number;

  createdBy: string;

  participants: string[];

  collaborators: string[];

  // Users who starred this note
  starredBy?: string[];

  // Optional future features
  isPinned?: boolean;

  // TRASH FEATURE
  isTrashed?: boolean;

  trashedAt?: number;

  // MULTI-TENANT WORKSPACE
  workspaceId?: string;

  // TAGS
  tags?: string[];
}