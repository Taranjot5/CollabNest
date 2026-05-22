import { NgModule } from '@angular/core';

import {
  RouterModule,
  Routes
} from '@angular/router';

import { authGuard } from './core/guards/auth.guard';

import { MainLayoutComponent } from './core/layout/main-layout/main-layout.component';

const routes: Routes = [

  // =========================
  // DEFAULT
  // =========================

  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full'
  },

  // =========================
  // AUTH
  // =========================

  {
    path: 'auth',

    loadChildren: () =>
      import('./features/auth/auth.module')
        .then(m => m.AuthModule)
  },

  // =========================
  // MAIN LAYOUT
  // =========================

  {
    path: '',

    component: MainLayoutComponent,

    canActivate: [authGuard],

    children: [

      // DASHBOARD

      {
        path: 'workspace',

        loadChildren: () =>
          import('./features/dashboard/dashboard.module')
            .then(m => m.DashboardModule)
      },

      // NOTES

      {
        path: 'notes',

        loadChildren: () =>
          import('./features/notes/notes.module')
            .then(m => m.NotesModule)
      },

      // Notifications
      
      {
        path: 'notifications',
        
        loadChildren: () =>
          import('./features/notifications/notifications.module')
            .then(m => m.NotificationsModule)
      }
    ]
  },

  // =========================
  // FALLBACK
  // =========================

  {
    path: '**',
    redirectTo: 'workspace'
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

export class AppRoutingModule {}