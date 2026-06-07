import { Injectable } from '@angular/core';

import {
  AngularFirestore
} from '@angular/fire/compat/firestore';

import {
  AngularFireAuth
} from '@angular/fire/compat/auth';

import {
  map
} from 'rxjs/operators';

import { Comment }
  from '../models/comment.model';

@Injectable({
  providedIn: 'root'
})
export class CommentService {

  constructor(


    private firestore:
      AngularFirestore,

    private auth:
      AngularFireAuth


  ) { }

  async addComment(

    noteId: string,

    workspaceId: string,

    message: string,

    userName: string

  ) {

    const user =
      await this.auth.currentUser;

    if (!user) {
      throw Error('Not authenticated');
    }

    return this.firestore
      .collection('comments')
      .add({


        noteId,

        workspaceId,

        userId: user.uid,

        userName,

        message,

        createdAt:
          Date.now()
      });


  }

  getComments(
    noteId: string
  ) {

    return this.firestore


      .collection(
        'comments',
        ref =>

          ref

            .where(
              'noteId',
              '==',
              noteId
            )

            .orderBy(
              'createdAt',
              'asc'
            )
      )

      .snapshotChanges()

      .pipe(

        map(actions =>

          actions.map(a => ({

            id: a.payload.doc.id,

            ...(a.payload.doc.data() as any)

          }))
        )
      );


  }

  deleteComment(
    commentId: string
  ) {

    return this.firestore

      .collection('comments')

      .doc(commentId)

      .delete();
  }
}
