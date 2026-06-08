import { inject } from '@angular/core';

import { Router, CanActivateFn, ActivatedRouteSnapshot } from '@angular/router';

import { AngularFireAuth } from '@angular/fire/compat/auth';

import { map, switchMap, take } from 'rxjs/operators';

import { of } from 'rxjs';

import { AuthService } from '../services/auth.service';

import { RolePermissionService } from '../services/role-permission.service';

import { AppPermission } from '../../models/role-permissions.model';

/** Restricts routes based on role permissions. Set `data.permission` on the route. */
export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {

  const afAuth = inject(AngularFireAuth);
  const authService = inject(AuthService);
  const rolePermission = inject(RolePermissionService);
  const router = inject(Router);

  const permission = route.data['permission'] as AppPermission | undefined;

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
            router.navigate(['/auth/login'], {
              queryParams: { reason: 'deactivated' }
            });
            return false;
          }

          if (!permission) {
            return true;
          }

          if (rolePermission.hasPermission(profile, permission)) {
            return true;
          }

          router.navigate(['/dashboard']);
          return false;
        })
      );
    })
  );
};
