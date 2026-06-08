import { inject } from '@angular/core';

import { Router, CanActivateFn } from '@angular/router';

import { AngularFireAuth } from '@angular/fire/compat/auth';

import { map, switchMap, take } from 'rxjs/operators';

import { of } from 'rxjs';

import { AuthService } from '../services/auth.service';

import { RolePermissionService } from '../services/role-permission.service';

/** Blocks deactivated users from accessing the app. */
export const activeUserGuard: CanActivateFn = () => {

  const afAuth = inject(AngularFireAuth);
  const authService = inject(AuthService);
  const rolePermission = inject(RolePermissionService);
  const router = inject(Router);

  return afAuth.authState.pipe(
    take(1),
    switchMap(user => {

      if (!user) {
        router.navigate(['/auth/login']);
        return of(false);
      }

      return authService.getUserById(user.uid).pipe(
        take(1),
        map(profile => {

          if (!rolePermission.isActive(profile)) {
            afAuth.signOut();
            router.navigate(['/auth/login'], {
              queryParams: { reason: 'deactivated' }
            });
            return false;
          }

          return true;
        })
      );
    })
  );
};
