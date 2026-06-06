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

import { map } from 'rxjs/operators';

import { Folder } from '../models/folder.model';

@Injectable({
providedIn: 'root'
})
export class FolderService {

constructor(
private firestore: AngularFirestore,
private afAuth: AngularFireAuth
) { }

async createFolder(
name: string,
workspaceId: string
) {

const user =
  await this.afAuth.currentUser;

if (!user) return;

return this.firestore
  .collection('folders')
  .add({

    name,

    workspaceId,

    createdBy: user.uid,

    createdAt: Date.now()
  });


}

getFolders(
workspaceId: string
): Observable<Folder[]> {


return this.firestore
  .collection<Folder>(
    'folders',
    ref =>
      ref
        .where(
          'workspaceId',
          '==',
          workspaceId
        )
        .orderBy(
          'createdAt',
          'asc'
        )
  )
  .snapshotChanges()
  .pipe(

    map(actions =>

      actions.map(a => {

        const data =
          a.payload.doc.data() as Folder;

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

updateFolder(
id: string,
name: string
) {

return this.firestore
  .collection('folders')
  .doc(id)
  .update({
    name
  });


}

deleteFolder(
id: string
) {


return this.firestore
  .collection('folders')
  .doc(id)
  .delete();


}
}
