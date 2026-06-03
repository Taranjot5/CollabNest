import { Injectable } from '@angular/core';

import {
  AngularFireAuth
} from '@angular/fire/compat/auth';

import {
  AngularFirestore
} from '@angular/fire/compat/firestore';

import firebase from 'firebase/compat/app';

@Injectable({
  providedIn: 'root'
})

export class AuthService {

  constructor(
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore
  ) {}

  // =========================
  // REGISTER
  // =========================

  async register(
    name: string,
    email: string,
    password: string
  ) {

    const userCredential =

      await this.afAuth
        .createUserWithEmailAndPassword(
          email,
          password
        );

    const uid =
      userCredential.user?.uid;

    if (!uid) return;

    await this.firestore
      .collection('users')
      .doc(uid)
      .set({

        uid,

        name,

        email,

        createdAt:
          Date.now()
      });

    return userCredential;
  }

  // =========================
  // LOGIN
  // =========================

  login(
    email: string,
    password: string
  ) {

    return this.afAuth
      .signInWithEmailAndPassword(
        email,
        password
      );
  }

  // =========================
  // GOOGLE LOGIN
  // =========================

  async googleLogin() {

    const result =
      await this.afAuth
        .signInWithPopup(

          new firebase.auth
            .GoogleAuthProvider()
        );

    const user =
      result.user;

    if (!user) return;

    await this.firestore
      .collection('users')
      .doc(user.uid)
      .set({

        uid: user.uid,

        name:
          user.displayName || '',

        email:
          user.email || '',

        createdAt:
          Date.now()
      },
      {
        merge: true
      });

    return result;
  }

  // =========================
  // GET USER BY ID
  // =========================

  getUserById(uid: string) {

    return this.firestore
      .collection('users')
      .doc(uid)
      .valueChanges();
  }

  // =========================
  // GET CURRENT USER
  // =========================

  getCurrentUser() {

    return this.afAuth.authState;
  }

  // =========================
  // LOGOUT
  // =========================

  logout() {

    return this.afAuth.signOut();
  }
}