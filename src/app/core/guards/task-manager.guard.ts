import { inject } from '@angular/core';

import { Router, CanActivateFn } from '@angular/router';

import { AngularFireAuth } from '@angular/fire/compat/auth';

import { map, switchMap, take } from 'rxjs/operators';

import { of } from 'rxjs';

import { AuthService } from '../services/auth.service';

import { TaskPermissionService } from '../../features/tasks/services/task-permission.service';

/** Allows Super Admin and Admin only (create/edit tasks). */
export const taskManagerGuard: CanActivateFn = () => {

  const afAuth = inject(AngularFireAuth);
  const authService = inject(AuthService);
  const permissionService = inject(TaskPermissionService);
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

          if (permissionService.canCreateTask(profile)) {
            return true;
          }

          router.navigate(['/tasks']);
          return false;
        })
      );
    })
  );
};
