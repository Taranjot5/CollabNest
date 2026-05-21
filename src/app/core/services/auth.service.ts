import { Injectable } from '@angular/core';

import {
  AngularFireAuth
} from '@angular/fire/compat/auth';

import firebase from 'firebase/compat/app';

import {
  AngularFirestore
} from '@angular/fire/compat/firestore';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore
  ) {}

  login(email: string, password: string) {

    return this.afAuth.signInWithEmailAndPassword(
      email,
      password
    );
  }

  register(email: string, password: string) {

    return this.afAuth.createUserWithEmailAndPassword(
      email,
      password
    );
  }

  async googleLogin() {

  const provider =
    new firebase.auth.GoogleAuthProvider();

  const result =
    await this.afAuth.signInWithPopup(
      provider
    );

  await this.firestore
    .collection('users')
    .doc(result.user?.uid)
    .set({
      email: result.user?.email
    });

  return result;
}

  logout() {

    return this.afAuth.signOut();
  }

  getAuthState() {

    return this.afAuth.authState;
  }
}