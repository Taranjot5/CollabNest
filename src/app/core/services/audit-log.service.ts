import { Injectable } from '@angular/core';

import { AngularFirestore } from '@angular/fire/compat/firestore';

import { AngularFireAuth } from '@angular/fire/compat/auth';

import { Observable } from 'rxjs';

import { map } from 'rxjs/operators';

export type AuditAction =
  | 'user.created'
  | 'user.updated'
  | 'user.deactivated'
  | 'user.activated'
  | 'user.role_changed'
  | 'workspace.created'
  | 'workspace.updated'
  | 'workspace.deleted'
  | 'member.invited'
  | 'member.removed'
  | 'member.role_changed'
  | 'note.created'
  | 'note.updated'
  | 'note.deleted'
  | 'note.shared'
  | 'folder.created'
  | 'folder.moved'
  | 'login'
  | 'logout';

export interface AuditLogEntry {

  id?: string;

  action: AuditAction;

  actorId: string;

  actorName: string;

  targetType: string;

  targetId: string;

  workspaceId?: string;

  message: string;

  metadata?: Record<string, unknown>;

  createdAt: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuditLogService {

  constructor(
    private firestore: AngularFirestore,
    private afAuth: AngularFireAuth
  ) {}

  async log(
    action: AuditAction,
    targetType: string,
    targetId: string,
    message: string,
    options?: {
      workspaceId?: string;
      actorName?: string;
      metadata?: Record<string, unknown>;
    }
  ): Promise<void> {

    const user = await this.afAuth.currentUser;

    if (!user) return;

    const entry: AuditLogEntry = {
      action,
      actorId: user.uid,
      actorName: options?.actorName || user.displayName || user.email || 'Unknown',
      targetType,
      targetId,
      workspaceId: options?.workspaceId || '',
      message,
      metadata: options?.metadata || {},
      createdAt: Date.now()
    };

    await this.firestore.collection('auditLogs').add(entry);
  }

  getLogs(limit = 100): Observable<AuditLogEntry[]> {

    return this.firestore
      .collection<AuditLogEntry>('auditLogs')
      .snapshotChanges()
      .pipe(
        map(actions =>
          actions
            .map(a => ({
              id: a.payload.doc.id,
              ...(a.payload.doc.data() as AuditLogEntry)
            }))
            .sort((a, b) => b.createdAt - a.createdAt)
            .slice(0, limit)
        )
      );
  }

  getWorkspaceLogs(workspaceId: string, limit = 50): Observable<AuditLogEntry[]> {

    return this.firestore
      .collection<AuditLogEntry>('auditLogs', ref =>
        ref
          .where('workspaceId', '==', workspaceId)
          .orderBy('createdAt', 'desc')
          .limit(limit)
      )
      .snapshotChanges()
      .pipe(
        map(actions =>
          actions.map(a => ({
            id: a.payload.doc.id,
            ...(a.payload.doc.data() as AuditLogEntry)
          }))
        )
      );
  }
}
