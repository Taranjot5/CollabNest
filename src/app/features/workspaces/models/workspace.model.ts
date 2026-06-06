export interface Workspace {

  id?: string;

  name: string;

  description?: string;

  createdBy: string;

  ownerId: string;

  createdAt: number;

  members: string[];

  admins: string[];

  imageUrl?: string;

  memberEmails?: string[];
}