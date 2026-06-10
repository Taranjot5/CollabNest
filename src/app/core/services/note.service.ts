import { Injectable } from '@angular/core';

import {
  AngularFirestore
} from '@angular/fire/compat/firestore';

import {
  AngularFireAuth
} from '@angular/fire/compat/auth';

import {
  Observable,
  of,
  switchMap
} from 'rxjs';

import {
  NoteVersionService
}
  from '../../features/notes/services/note-version.service';

import { map } from 'rxjs/operators';

import firebase from 'firebase/compat/app';

import { Note } from '../../features/notes/models/note.model';

import { NotificationService } from './notification.service';

import { AuditLogService } from './audit-log.service';

@Injectable({
  providedIn: 'root'
})

export class NoteService {

  constructor(
    private noteVersionService: NoteVersionService,
    private firestore: AngularFirestore,
    private afAuth: AngularFireAuth,
    private notificationService: NotificationService,
    private auditLog: AuditLogService
  ) { }

  // =========================
  // GET NOTES
  // =========================

  getNotes(
    workspaceId?: string
  ): Observable<Note[]> {

    return this.afAuth.authState.pipe(

      switchMap(user => {

        if (!user) {

          return of([]);
        }

        return this.firestore
          .collection<Note>('notes', ref => {

            let query:
              firebase.firestore.Query =
              ref

                .where(
                  'participants',
                  'array-contains',
                  user.uid
                )

                .orderBy(
                  'updatedAt',
                  'desc'
                );

            // =========================
            // WORKSPACE FILTER
            // =========================

            if (workspaceId) {

              query = query.where(
                'workspaceId',
                '==',
                workspaceId
              );
            }

            return query;
          })

          .snapshotChanges()

          .pipe(

            map(actions =>

              actions.map(a => {

                const data =
                  a.payload.doc.data() as Note;

                const id =
                  a.payload.doc.id;

                return {
                  id,
                  ...data
                };
              })
            ),

            map(notes =>

              notes.filter(note =>

                !note.isTrashed

                &&

                (
                  workspaceId

                    ? note.workspaceId === workspaceId

                    : !note.workspaceId
                )
              )
            )
          );
      })
    );
  }

  // =========================
  // CREATE NOTE
  // =========================

  async createNote(

    title: string,

    content: string,

    category: string,

    priority: string,

    workspaceId?: string,

    folderId?: string
  ) {

    const user =
      await this.afAuth.currentUser;

    if (!user) return;

    const note: any = {

      title,

      content,

      category,

      priority,

      createdAt: Date.now(),

      updatedAt: Date.now(),

      createdBy: user.uid,

      participants: [user.uid],

      collaborators: [],

      starredBy: [],

      isPinned: false,

      isTrashed: false,

      trashedAt: 0,

      folderId: folderId || '',
      workspaceId: workspaceId || ''
    };

    const docRef = await this.firestore
      .collection('notes')
      .add(note);

    await this.auditLog.log(
      'note.created',
      'note',
      docRef.id,
      `Note "${title}" created`,
      { workspaceId: workspaceId || '' }
    );

    return docRef;
  }

  // =========================
  // GET SINGLE NOTE
  // =========================

  getNoteById(id: string) {

    return this.firestore
      .collection('notes')
      .doc<Note>(id)
      .valueChanges({ idField: 'id' });
  }

  // =========================
  // UPDATE NOTE
  // =========================
  async updateNote(

    id: string,

    note: Partial<Note>

  ) {

    const user =
      await this.afAuth.currentUser;

    if (!user) {
      throw new Error('You must be signed in to update notes');
    }

    const snapshot = await this.firestore
      .collection('notes')
      .doc(id)
      .ref
      .get();

    if (!snapshot.exists) {
      throw new Error('Note not found');
    }

    const existing =
      snapshot.data() as Note;

    try {
      await this.noteVersionService.saveVersion(
        id,
        existing.title,
        existing.content,
        user.uid
      );
    } catch {
      // Version history is optional; do not block note save
    }

    await this.firestore
      .collection('notes')
      .doc(id)
      .update({
        ...note,
        updatedAt: Date.now()
      });

    await this.auditLog.log(
      'note.updated',
      'note',
      id,
      `Note "${note.title || existing.title}" updated`,
      { workspaceId: existing.workspaceId || '' }
    );
  }


  // =========================
  // MOVE NOTE TO TRASH
  // =========================

  async deleteNote(id: string) {

    const snapshot = await this.firestore.collection('notes').doc(id).ref.get();
    const existing = snapshot.data() as Note | undefined;

    await this.firestore
      .collection('notes')
      .doc(id)
      .update({
        isTrashed: true,
        trashedAt: Date.now()
      });

    await this.auditLog.log(
      'note.deleted',
      'note',
      id,
      `Note "${existing?.title || 'Untitled'}" moved to trash`,
      { workspaceId: existing?.workspaceId || '' }
    );
  }

  // =========================
  // GET TRASH NOTES
  // =========================

  getTrashNotes(): Observable<Note[]> {

    return this.afAuth.authState.pipe(

      switchMap(user => {

        if (!user) {

          return of([]);
        }

        return this.firestore
          .collection<Note>('notes', ref =>

            ref
              .where(
                'participants',
                'array-contains',
                user.uid
              )

              .orderBy(
                'updatedAt',
                'desc'
              )
          )

          .snapshotChanges()

          .pipe(

            map(actions =>

              actions.map(a => {

                const data =
                  a.payload.doc.data() as Note;

                const id =
                  a.payload.doc.id;

                return {
                  id,
                  ...data
                };
              })
            ),

            map(notes =>

              notes.filter(note =>

                note.isTrashed
              )
            )
          );
      })
    );
  }

  // =========================
  // RESTORE NOTE
  // =========================

  restoreNote(id: string) {

    return this.firestore
      .collection('notes')
      .doc(id)
      .update({

        isTrashed: false,

        trashedAt: 0
      });
  }

  // =========================
  // DELETE FOREVER
  // =========================

  deleteForever(id: string) {

    return this.firestore
      .collection('notes')
      .doc(id)
      .delete();
  }

  // =========================
  // SHARE NOTE
  // =========================

  async shareNote(

    noteId: string,

    collaboratorEmail: string

  ) {

    const usersRef =
      this.firestore.collection(
        'users',

        ref =>

          ref.where(
            'email',
            '==',
            collaboratorEmail
          )
      );

    const snapshot =
      await usersRef.get().toPromise();

    if (!snapshot?.docs.length) {

      alert('User not found');

      return;
    }

    const collaboratorUid =
      snapshot.docs[0].id;

    // =========================
    // ADD COLLABORATOR
    // =========================

    await this.firestore
      .collection('notes')
      .doc(noteId)
      .update({

        participants:

          firebase.firestore
            .FieldValue
            .arrayUnion(
              collaboratorUid
            ),

        collaborators:

          firebase.firestore
            .FieldValue
            .arrayUnion(
              collaboratorEmail
            )
      });

    // =========================
    // CREATE NOTIFICATION
    // =========================

    await this.notificationService
      .createNotification(

        'New Shared Note',

        'A note was shared with you',

        'share',

        collaboratorUid
      );

    console.log(
      'Notification created for:',
      collaboratorUid
    );

    alert('Collaborator added');
  }
  // =========================
  // TOGGLE PIN NOTE
  // =========================

  togglePin(
    noteId: string,
    currentValue: boolean
  ) {
    return this.firestore
      .collection('notes')
      .doc(noteId)
      .update({
        isPinned: !currentValue,
        updatedAt: Date.now()
      });
  }

  // =========================
  // TOGGLE STAR NOTE
  // =========================

  async toggleStar(

    noteId: string,

    starredBy: string[]

  ) {

    const user =
      await this.afAuth.currentUser;

    if (!user) return;

    const isStarred =
      starredBy.includes(user.uid);

    return this.firestore
      .collection('notes')
      .doc(noteId)
      .update({

        starredBy: isStarred

          ? firebase.firestore
            .FieldValue
            .arrayRemove(
              user.uid
            )

          : firebase.firestore
            .FieldValue
            .arrayUnion(
              user.uid
            )
      });
  }

  // =========================
  // GET STARRED NOTES
  // =========================

  getStarredNotes():
    Observable<Note[]> {

    return this.afAuth.authState.pipe(

      switchMap(user => {

        if (!user) {

          return of([]);
        }

        return this.firestore
          .collection<Note>('notes', ref =>

            ref
              .where(
                'participants',
                'array-contains',
                user.uid
              )

              .orderBy(
                'updatedAt',
                'desc'
              )
          )

          .snapshotChanges()

          .pipe(

            map(actions =>

              actions
                .map(a => {

                  const data =
                    a.payload.doc.data() as Note;

                  const id =
                    a.payload.doc.id;

                  return {
                    id,
                    ...data
                  };
                })

                .filter(note =>

                  note.starredBy?.includes(
                    user.uid
                  )

                  &&

                  !note.isTrashed
                )
            )
          );
      })
    );
  }
}