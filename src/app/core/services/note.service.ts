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

@Injectable({
  providedIn: 'root'
})

export class NoteService {

  constructor(
    private noteVersionService: NoteVersionService,
    private firestore: AngularFirestore,
    private afAuth: AngularFireAuth,
    private notificationService: NotificationService
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

      isTrashed: false,

      trashedAt: 0,

      folderId: folderId || ''
    };

    if (workspaceId) {
      note.workspaceId = workspaceId;
    }

    return this.firestore
      .collection('notes')
      .add(note);
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
      return;
    }

    const snapshot =


      await this.firestore

        .collection('notes')

        .doc(id)

        .ref

        .get();


    if (!snapshot.exists) {
      return;
    }

    const existing =
      snapshot.data() as Note;

    await this
      .noteVersionService
      .saveVersion(


        id,

        existing.title,

        existing.content,

        user.uid
      );


    return this.firestore


      .collection('notes')

      .doc(id)

      .update({

        ...note,

        updatedAt:
          Date.now()
      });


  }


  // =========================
  // MOVE NOTE TO TRASH
  // =========================

  deleteNote(id: string) {

    return this.firestore
      .collection('notes')
      .doc(id)
      .update({

        isTrashed: true,

        trashedAt: Date.now()
      });
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