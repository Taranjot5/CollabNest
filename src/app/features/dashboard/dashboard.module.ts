import { NgModule } from '@angular/core';

import {
  RouterModule,
  Routes
} from '@angular/router';

import { WorkspaceDashboardComponent } from './pages/workspace-dashboard/workspace-dashboard.component';
import { StarredNotesComponent } from './pages/starred-notes/starred-notes.component';
import { SharedNotesComponent } from './pages/shared-notes/shared-notes.component';
import { RecentNotesComponent } from './pages/recent-notes/recent-notes.component';

const routes: Routes = [

  {
    path: '',
    component: WorkspaceDashboardComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],

  exports: [
    RouterModule
  ],

  declarations: [
     StarredNotesComponent,
     SharedNotesComponent,
     RecentNotesComponent

  ]
})
export class DashboardModule {}