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

import { map } from 'rxjs/operators';

import firebase from 'firebase/compat/app';

import { Note } from '../../features/notes/models/note.model';

@Injectable({
  providedIn: 'root'
})
export class NoteService {

  constructor(
    private firestore: AngularFirestore,
    private afAuth: AngularFireAuth
  ) { }

  // =========================
  // GET NOTES
  // =========================

  getNotes(): Observable<Note[]> {

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
    priority: string
  ) {

    const user =
      await this.afAuth.currentUser;

    if (!user) return;

    const note: Note = {

      title,
      content,

      category,
      priority,

      createdAt: Date.now(),
      updatedAt: Date.now(),

      createdBy: user.uid,

      participants: [user.uid],

      collaborators: [],

      starredBy: []
    };

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

  updateNote(
    id: string,
    note: Partial<Note>
  ) {

    return this.firestore
      .collection('notes')
      .doc(id)
      .update({

        ...note,

        updatedAt: Date.now()
      });
  }

  // =========================
  // DELETE NOTE
  // =========================

  deleteNote(id: string) {

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

    await this.firestore
      .collection('notes')
      .doc(noteId)
      .update({

        participants:
          firebase.firestore.FieldValue.arrayUnion(
            collaboratorUid
          ),

        collaborators:
          firebase.firestore.FieldValue.arrayUnion(
            collaboratorEmail
          )
      });

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

          ? firebase.firestore.FieldValue.arrayRemove(
            user.uid
          )

          : firebase.firestore.FieldValue.arrayUnion(
            user.uid
          )
      });
  }

  // =========================
  // GET STARRED NOTES
  // =========================

  getStarredNotes(): Observable<Note[]> {

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
                  note.starredBy?.includes(user.uid)
                )
            )
          );
      })
    );
  }
}