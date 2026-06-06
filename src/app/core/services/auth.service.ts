import { Injectable } from '@angular/core';

import {
  AngularFireAuth
} from '@angular/fire/compat/auth';

import {
  AngularFirestore
} from '@angular/fire/compat/firestore';

import firebase from 'firebase/compat/app';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class AuthService {

  constructor(
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore
  ) { }

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

        bio: '',

        department: '',

        designation: '',

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

        bio: '',

        department: '',

        designation: '',

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
      .valueChanges()

      .pipe(

        map((user: any) => ({

          ...user,

          id: uid
        }))
      );
  }

  // =========================
  // GET CURRENT USER
  // =========================

  getCurrentUser() {

    return this.afAuth.authState;
  }

  // =========================
  // UPDATE PROFILE
  // =========================

  updateProfile(

    uid: string,

    data: {


      name: string;

      bio: string;

      department: string;

      designation: string;


    }

  ) {

    return this.firestore
      .collection('users')
      .doc(uid)
      .update(data);
  }


  // =========================
  // LOGOUT
  // =========================

  logout() {

    return this.afAuth.signOut();
  }
}