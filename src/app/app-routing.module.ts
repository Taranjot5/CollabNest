import { NgModule } from '@angular/core';

import {
  RouterModule,
  Routes
} from '@angular/router';

import { authGuard } from './core/guards/auth.guard';

import { activeUserGuard } from './core/guards/active-user.guard';

import { roleGuard } from './core/guards/role.guard';

import { superAdminGuard } from './core/guards/super-admin.guard';

import { MainLayoutComponent } from './core/layout/main-layout/main-layout.component';
import { ProfileComponent } from './features/profile/profile/profile.component';

const routes: Routes = [

  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full'
  },

  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.module')
        .then(m => m.AuthModule)
  },

  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard, activeUserGuard],
    children: [

      {
        path: 'dashboard',
        loadChildren: () =>
          import('./features/dashboard/dashboard.module')
            .then(m => m.DashboardModule),
        canActivate: [roleGuard],
        data: { permission: 'dashboard' }
      },

      {
        path: 'workspace',
        redirectTo: 'dashboard',
        pathMatch: 'prefix'
      },

      {
        path: 'notes',
        loadChildren: () =>
          import('./features/notes/notes.module')
            .then(m => m.NotesModule),
        canActivate: [roleGuard],
        data: { permission: 'notes' }
      },

      {
        path: 'notifications',
        loadChildren: () =>
          import('./features/notifications/notifications.module')
            .then(m => m.NotificationsModule),
        canActivate: [roleGuard],
        data: { permission: 'notifications' }
      },

      {
        path: 'workspaces',
        loadChildren: () =>
          import('./features/workspaces/workspace.module')
            .then(m => m.WorkspaceModule),
        canActivate: [roleGuard],
        data: { permission: 'workspaces' }
      },

      {
        path: 'tasks',
        loadChildren: () =>
          import('./features/tasks/tasks.module')
            .then(m => m.TasksModule),
        canActivate: [roleGuard],
        data: { permission: 'tasks' }
      },

      {
        path: 'search',
        loadChildren: () =>
          import('./features/search/search.module')
            .then(m => m.SearchModule)
      },

      {
        path: 'admin',
        loadChildren: () =>
          import('./features/admin/admin.module')
            .then(m => m.AdminModule),
        canActivate: [superAdminGuard]
      },

      {
        path: 'profile',
        component: ProfileComponent
      },

      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },

  {
    path: '**',
    redirectTo: 'dashboard'
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule { }
