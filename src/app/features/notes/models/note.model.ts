import { Attachment } from './attachment.model';

export type NoteWorkflowStatus = 'draft' | 'review' | 'published';

export interface Note {

    id?: string;

    title: string;

    content: string;

    category: string;

    priority: string;

    workflowStatus?: NoteWorkflowStatus;

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

    attachments?: Attachment[];

    linkedNoteIds?: string[];

    lastEditedBy?: string;
}
