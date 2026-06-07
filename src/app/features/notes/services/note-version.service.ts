import { Injectable } from '@angular/core';

import {
  AngularFirestore
} from '@angular/fire/compat/firestore';

import {
  map
} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class NoteVersionService {

  constructor(
    private firestore:
      AngularFirestore
  ) { }

  saveVersion(
    noteId: string,
    title: string,
    content: string,
    updatedBy: string
  ) {


    return this.firestore

      .collection(
        'noteVersions'
      )

      .add({

        noteId,

        title,

        content,

        updatedBy,

        createdAt:
          Date.now()
      });


  }

  getVersions(
    noteId: string
  ) {


    return this.firestore

      .collection(
        'noteVersions',

        ref =>

          ref

            .where(
              'noteId',
              '==',
              noteId
            )

            .orderBy(
              'createdAt',
              'desc'
            )
      )

      .snapshotChanges()

      .pipe(

        map(actions =>

          actions.map(a => ({

            id:
              a.payload.doc.id,

            ...(a.payload.doc.data()as any)

      }))
    )
  );


}
}
