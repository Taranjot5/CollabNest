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

starredBy?: string[];

isPinned?: boolean;

isTrashed?: boolean;

trashedAt?: number;

workspaceId?: string;

folderId?: string;

tags?: string[];
}
