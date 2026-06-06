import { Injectable } from '@angular/core';

import {
  AngularFirestore
} from '@angular/fire/compat/firestore';

import {
  Observable
} from 'rxjs';

import {
  map
} from 'rxjs/operators';

import {
  Activity
} from '../models/activity.model';

@Injectable({
  providedIn: 'root'
})
export class ActivityService {

  constructor(
    private firestore: AngularFirestore
  ) {}

  // =========================
  // CREATE ACTIVITY
  // =========================

  createActivity(
    activity: Activity
  ) {

    return this.firestore
      .collection('workspace-activities')
      .add(activity);
  }

  // =========================
  // GET ACTIVITIES
  // =========================

  getActivities(
    workspaceId: string
  ): Observable<Activity[]> {

    return this.firestore
      .collection<Activity>(
        'workspace-activities',

        ref =>

          ref
            .where(
              'workspaceId',
              '==',
              workspaceId
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
              a.payload.doc.data() as Activity;

            const id =
              a.payload.doc.id;

            return {
              id,
              ...data
            };
          })
        )
      );
  }
}