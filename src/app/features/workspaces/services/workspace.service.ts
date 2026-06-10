
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

import { AuditLogService } from '../../../core/services/audit-log.service';

export interface WorkspaceActivity {

  id?: string;

  workspaceId: string;

  action: string;

  userId: string;

  message: string;

  createdAt: number;
}

@Injectable({
  providedIn: 'root'
})
export class WorkspaceService {

  constructor(
    private firestore: AngularFirestore,
    private afAuth: AngularFireAuth,
    private auditLog: AuditLogService
  ) { }

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

      ownerId: user.uid,

      createdAt: Date.now(),

      members: [user.uid],

      admins: [user.uid]
    };

    const docRef =
      await this.firestore
        .collection('workspaces')
        .add(workspace);

    await this.addActivity(
      docRef.id,
      'workspace_created',
      `${name} workspace created`
    );

    await this.auditLog.log(
      'workspace.created',
      'workspace',
      docRef.id,
      `Workspace "${name}" created`,
      { workspaceId: docRef.id }
    );

    return docRef;
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
  // GET WORKSPACE
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
  // GET ALL WORKSPACES (ADMIN)
  // =========================

  getAllWorkspaces(): Observable<Workspace[]> {

    return this.firestore
      .collection<Workspace>('workspaces', ref =>
        ref.orderBy('createdAt', 'desc')
      )
      .snapshotChanges()
      .pipe(
        map(actions =>
          actions.map(a => ({
            id: a.payload.doc.id,
            ...(a.payload.doc.data() as Workspace)
          }))
        )
      );
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

    await this.addActivity(

      workspaceId,

      'member_added',

      `${email} joined workspace`
    );

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

    await this.addActivity(

      workspaceId,

      'member_removed',

      'A member was removed'
    );
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

  // =========================
  // ACTIVITY FEED
  // =========================

  async addActivity(

    workspaceId: string,

    action: string,

    message: string

  ) {

    const user =
      await this.afAuth.currentUser;

    if (!user) return;

    const activity: WorkspaceActivity = {

      workspaceId,

      action,

      message,

      userId: user.uid,

      createdAt: Date.now()
    };

    return this.firestore
      .collection('workspaceActivities')
      .add(activity);
  }

  // =========================
  // GET ACTIVITIES
  // =========================

  getActivities(
    workspaceId: string
  ): Observable<WorkspaceActivity[]> {

    return this.firestore
      .collection<WorkspaceActivity>(
        'workspaceActivities',
        ref =>
          ref.where('workspaceId', '==', workspaceId)
      )
      .snapshotChanges()
      .pipe(
        map(actions =>
          actions.map(a => {
            const data = a.payload.doc.data() as WorkspaceActivity;
            const id = a.payload.doc.id;
            return {
              id,
              ...data
            };
          }).sort((a, b) => b.createdAt - a.createdAt)
        )
      );
  }

  // =========================
  // MAKE ADMIN
  // =========================

  // =========================
  // MAKE ADMIN
  // =========================

  async makeAdmin(


    workspaceId: string,

    memberId: string


  ) {


    await this.firestore
      .collection('workspaces')
      .doc(workspaceId)
      .update({

        admins:

          firebase.firestore
            .FieldValue
            .arrayUnion(memberId)
      });

    await this.addActivity(

      workspaceId,

      'admin_added',

      'A member was promoted to admin'
    );


  }

  // =========================
  // REMOVE ADMIN
  // =========================

  async removeAdmin(


    workspaceId: string,

    memberId: string


  ) {


    await this.firestore
      .collection('workspaces')
      .doc(workspaceId)
      .update({

        admins:

          firebase.firestore
            .FieldValue
            .arrayRemove(memberId)
      });

    await this.addActivity(

      workspaceId,

      'admin_removed',

      'Admin role removed'
    );


  }

}