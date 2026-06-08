export type WorkspaceMemberRole = 'owner' | 'admin' | 'member';

export interface Workspace {

  id?: string;

  name: string;

  description?: string;

  createdBy: string;

  ownerId: string;

  createdAt: number;

  updatedAt?: number;

  members: string[];

  admins: string[];

  /** Optional explicit role map; derived from ownerId/admins if absent */
  memberRoles?: Record<string, WorkspaceMemberRole>;

  imageUrl?: string;

  memberEmails?: string[];

  settings?: {
    defaultNoteVisibility?: 'private' | 'workspace';
    allowGuestComments?: boolean;
  };
}