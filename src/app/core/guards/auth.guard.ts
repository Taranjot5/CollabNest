import { inject } from '@angular/core';

import {
  Router,
  CanActivateFn
} from '@angular/router';

import { AngularFireAuth } from '@angular/fire/compat/auth';

import {
  map
} from 'rxjs/operators';

export const authGuard: CanActivateFn = () => {

  const afAuth = inject(AngularFireAuth);

  const router = inject(Router);

  return afAuth.user.pipe(

    map(user => {

      if (user) {

        return true;
      }

      router.navigate([
        '/auth/login'
      ]);

      return false;
    })
  );
};