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
  map
} from 'rxjs/operators';

import firebase from 'firebase/compat/app';

import {
  Workspace
} from '../models/workspace.model';

@Injectable({
  providedIn: 'root'
})

export class WorkspaceService {

  constructor(
    private firestore: AngularFirestore,
    private afAuth: AngularFireAuth
  ) {}

  // =========================
  // CREATE WORKSPACE
  // =========================

  async createWorkspace(
    name: string,
    description: string
  ) {

    const user =
      await this.afAuth.currentUser;

    if (!user) return;

    const workspace: Workspace = {

      name,

      description,

      createdBy: user.uid,

      createdAt: Date.now(),

      members: [
        user.uid
      ],

      admins: [
        user.uid
      ]
    };

    return this.firestore
      .collection('workspaces')
      .add(workspace);
  }

  // =========================
  // GET USER WORKSPACES
  // =========================

  getUserWorkspaces():
    Observable<Workspace[]> {

    return this.afAuth.authState.pipe(

      switchMap(user => {

        if (!user) {

          return of([]);
        }

        return this.firestore
          .collection<Workspace>(
            'workspaces',

            ref => ref

              .where(
                'members',
                'array-contains',
                user.uid
              )

              .orderBy(
                'createdAt',
                'desc'
              )
          )

          .snapshotChanges()

          .pipe(

            map(actions =>

              actions.map(a => {

                const data =
                  a.payload.doc.data() as Workspace;

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
  // GET WORKSPACE BY ID
  // =========================

  getWorkspaceById(
    id: string
  ) {

    return this.firestore
      .collection('workspaces')
      .doc<Workspace>(id)
      .valueChanges({

        idField: 'id'
      });
  }

  // =========================
  // INVITE MEMBER
  // =========================

  async inviteMember(

    workspaceId: string,

    email: string

  ) {

    const usersRef =
      this.firestore.collection(

        'users',

        ref =>

          ref.where(
            'email',
            '==',
            email
          )
      );

    const snapshot =
      await usersRef.get().toPromise();

    if (!snapshot?.docs.length) {

      alert('User not found');

      return;
    }

    const userDoc =
      snapshot.docs[0];

    const userId =
      userDoc.id;

    await this.firestore
      .collection('workspaces')
      .doc(workspaceId)
      .update({

        members:

          firebase.firestore
            .FieldValue
            .arrayUnion(
              userId
            )
      });

    alert('Member added successfully');
  }

  // =========================
  // REMOVE MEMBER
  // =========================

  async removeMember(

    workspaceId: string,

    memberId: string

  ) {

    await this.firestore
      .collection('workspaces')
      .doc(workspaceId)
      .update({

        members:

          firebase.firestore
            .FieldValue
            .arrayRemove(
              memberId
            )
      });
  }

  // =========================
  // DELETE WORKSPACE
  // =========================

  async deleteWorkspace(
    workspaceId: string
  ) {

    return this.firestore
      .collection('workspaces')
      .doc(workspaceId)
      .delete();
  }
}