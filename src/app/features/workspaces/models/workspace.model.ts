export interface Workspace {

  id?: string;

  name: string;

  description?: string;

  createdBy: string;

  createdAt: number;

  members: string[];

  admins: string[];

  imageUrl?: string;

  memberEmails?: string[];
}