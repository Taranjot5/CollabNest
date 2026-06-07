import { Injectable } from '@angular/core';

import {
  AngularFireStorage
}
  from '@angular/fire/compat/storage';

import {
  AngularFireAuth
}
  from '@angular/fire/compat/auth';

import {
  finalize
} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  constructor(

    private storage:
      AngularFireStorage,

    private auth:
      AngularFireAuth

  ) { }

  async uploadFile(
    file: File,
    workspaceId: string
  ): Promise<any> {

    const user =
      await this.auth.currentUser;

    if (!user) {
      throw Error('No user');
    }

    const path =

      `attachments/
     ${workspaceId}/
     ${Date.now()}_${file.name}`;

    const ref =
      this.storage.ref(path);

    const task =
      this.storage.upload(
        path,
        file
      );

    return new Promise(

      (resolve, reject) => {

        task.snapshotChanges()

          .pipe(

            finalize(() => {

              ref.getDownloadURL()
                .subscribe(url => {

                  resolve({

                    name: file.name,

                    url,

                    size: file.size,

                    type: file.type,

                    uploadedAt:
                      Date.now(),

                    uploadedBy:
                      user.uid
                  });
                });
            })
          )
          .subscribe({
            error: reject
          });
      });
  }
}