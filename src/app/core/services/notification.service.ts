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

export interface Notification {

  id?: string;

  title: string;

  message: string;

  type: string;

  receiverId: string;

  createdAt: number;

  read: boolean;
}

@Injectable({
  providedIn: 'root'
})

export class NotificationService {

  constructor(
    private firestore: AngularFirestore,
    private afAuth: AngularFireAuth
  ) {}

  // =========================
  // CREATE NOTIFICATION
  // =========================

  async createNotification(

    title: string,

    message: string,

    type: string,

    receiverId: string

  ) {

    const notification: Notification = {

      title,

      message,

      type,

      receiverId,

      createdAt: Date.now(),

      read: false
    };

    return this.firestore
      .collection('notifications')
      .add(notification);
  }

  // =========================
  // GET NOTIFICATIONS
  // =========================

  getNotifications():
    Observable<Notification[]> {

    return this.afAuth.authState.pipe(

      switchMap(user => {

        if (!user) {

          return of([]);
        }

        return this.firestore
          .collection<Notification>(
            'notifications',

            ref => ref

              .where(
                'receiverId',
                '==',
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
                  a.payload.doc.data() as Notification;

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
  // MARK AS READ
  // =========================

  markAsRead(id: string) {

    return this.firestore
      .collection('notifications')
      .doc(id)
      .update({

        read: true
      });
  }

  // =========================
  // DELETE NOTIFICATION
  // =========================

  deleteNotification(id: string) {

    return this.firestore
      .collection('notifications')
      .doc(id)
      .delete();
  }
}