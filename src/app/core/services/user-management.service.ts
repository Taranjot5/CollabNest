import { Injectable } from '@angular/core';

import { AngularFirestore } from '@angular/fire/compat/firestore';

import { AngularFireAuth } from '@angular/fire/compat/auth';

import { Observable } from 'rxjs';

import { map } from 'rxjs/operators';

import firebase from 'firebase/compat/app';

import { environment } from '../../../environments/environment';

import {
  AppUser,
  CreateUserPayload,
  StoredUserRole,
  UpdateUserPayload,
  UserStatus
} from '../../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserManagementService {

  private secondaryApp: firebase.app.App | null = null;

  constructor(
    private firestore: AngularFirestore,
    private afAuth: AngularFireAuth
  ) {}

  // =========================
  // LIST USERS (REAL-TIME)
  // =========================

  getUsers(): Observable<AppUser[]> {

    return this.firestore
      .collection<AppUser>('users', ref =>
        ref.orderBy('createdAt', 'desc')
      )
      .valueChanges({ idField: 'uid' })
      .pipe(
        map(users =>
          users.map(user => ({
            ...user,
            status: user.status || 'active',
            workspaceIds: user.workspaceIds || []
          }))
        )
      );
  }

  getUserById(uid: string): Observable<AppUser | undefined> {

    return this.firestore
      .collection<AppUser>('users')
      .doc(uid)
      .valueChanges()
      .pipe(
        map(user => {

          if (!user) return undefined;

          return {
            ...user,
            uid,
            status: user.status || 'active',
            workspaceIds: user.workspaceIds || []
          };
        })
      );
  }

  // =========================
  // CREATE USER
  // =========================

  async createUser(payload: CreateUserPayload): Promise<string> {

    const secondaryAuth = this.getSecondaryAuth();

    const credential = await secondaryAuth
      .createUserWithEmailAndPassword(
        payload.email,
        payload.password
      );

    const uid = credential.user?.uid;

    if (!uid) {
      throw new Error('Failed to create user account');
    }

    await secondaryAuth.signOut();

    await this.firestore
      .collection('users')
      .doc(uid)
      .set({
        uid,
        name: payload.name,
        email: payload.email,
        role: payload.role,
        status: 'active' as UserStatus,
        department: payload.department,
        designation: payload.designation,
        bio: '',
        workspaceIds: payload.workspaceIds,
        createdAt: Date.now(),
        updatedAt: Date.now()
      });

    await this.syncWorkspaceMembership(uid, [], payload.workspaceIds);

    return uid;
  }

  // =========================
  // UPDATE USER
  // =========================

  async updateUser(
    uid: string,
    payload: UpdateUserPayload,
    previousWorkspaceIds: string[] = []
  ): Promise<void> {

    await this.firestore
      .collection('users')
      .doc(uid)
      .update({
        name: payload.name,
        email: payload.email,
        role: payload.role,
        status: payload.status,
        department: payload.department,
        designation: payload.designation,
        workspaceIds: payload.workspaceIds,
        updatedAt: Date.now()
      });

    await this.syncWorkspaceMembership(
      uid,
      previousWorkspaceIds,
      payload.workspaceIds
    );
  }

  async updateUserRole(uid: string, role: StoredUserRole): Promise<void> {

    await this.firestore
      .collection('users')
      .doc(uid)
      .update({
        role,
        updatedAt: Date.now()
      });
  }

  async setUserStatus(uid: string, status: UserStatus): Promise<void> {

    await this.firestore
      .collection('users')
      .doc(uid)
      .update({
        status,
        updatedAt: Date.now()
      });
  }

  // =========================
  // PASSWORD RESET
  // =========================

  async sendPasswordReset(email: string): Promise<void> {
    await this.afAuth.sendPasswordResetEmail(email);
  }

  // =========================
  // BOOTSTRAP CHECK
  // =========================

  async hasSuperAdmin(): Promise<boolean> {

    const snapshot = await this.firestore
      .collection('users', ref =>
        ref.where('role', '==', 'super_admin').limit(1)
      )
      .get()
      .toPromise();

    return (snapshot?.docs.length ?? 0) > 0;
  }

  // =========================
  // WORKSPACE SYNC
  // =========================

  async syncWorkspaceMembership(
    userId: string,
    previousIds: string[],
    nextIds: string[]
  ): Promise<void> {

    const toAdd = nextIds.filter(id => !previousIds.includes(id));
    const toRemove = previousIds.filter(id => !nextIds.includes(id));

    const batch = this.firestore.firestore.batch();

    for (const workspaceId of toAdd) {

      const ref = this.firestore
        .collection('workspaces')
        .doc(workspaceId).ref;

      batch.update(ref, {
        members: firebase.firestore.FieldValue.arrayUnion(userId)
      });
    }

    for (const workspaceId of toRemove) {

      const ref = this.firestore
        .collection('workspaces')
        .doc(workspaceId).ref;

      batch.update(ref, {
        members: firebase.firestore.FieldValue.arrayRemove(userId),
        admins: firebase.firestore.FieldValue.arrayRemove(userId)
      });
    }

    if (toAdd.length || toRemove.length) {
      await batch.commit();
    }
  }

  private getSecondaryAuth(): firebase.auth.Auth {

    if (!this.secondaryApp) {
      this.secondaryApp = firebase.initializeApp(
        environment.firebaseConfig,
        'UserManagementSecondary'
      );
    }

    return this.secondaryApp.auth();
  }
}
