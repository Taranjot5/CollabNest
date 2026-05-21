import { NgModule } from '@angular/core';

import {
  RouterModule,
  Routes
} from '@angular/router';

import { WorkspaceDashboardComponent } from './pages/workspace-dashboard/workspace-dashboard.component';

import { RecentNotesComponent } from './pages/recent-notes/recent-notes.component';

import { SharedNotesComponent } from './pages/shared-notes/shared-notes.component';

import { StarredNotesComponent } from './pages/starred-notes/starred-notes.component';

const routes: Routes = [

  // DASHBOARD HOME

  {
    path: '',
    component: WorkspaceDashboardComponent,
    pathMatch: 'full'
  },

  // RECENT

  {
    path: 'recent',
    component: RecentNotesComponent
  },

  // SHARED

  {
    path: 'shared',
    component: SharedNotesComponent
  },

  // STARRED

  {
    path: 'starred',
    component: StarredNotesComponent
  }
];

@NgModule({

  imports: [
    RouterModule.forChild(routes)
  ],

  exports: [
    RouterModule
  ]
})

export class DashboardRoutingModule {}