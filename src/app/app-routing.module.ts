import { NgModule } from '@angular/core';

import {
  RouterModule,
  Routes
} from '@angular/router';

import { authGuard } from './core/guards/auth.guard';

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
    canActivate: [authGuard],
    children: [

      {
        path: 'dashboard',
        loadChildren: () =>
          import('./features/dashboard/dashboard.module')
            .then(m => m.DashboardModule)
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
            .then(m => m.NotesModule)
      },

      {
        path: 'notifications',
        loadChildren: () =>
          import('./features/notifications/notifications.module')
            .then(m => m.NotificationsModule)
      },

      {
        path: 'workspaces',
        loadChildren: () =>
          import('./features/workspaces/workspace.module')
            .then(m => m.WorkspaceModule)
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
