import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { DashboardRoutingModule } from './dashboard-routing.module';

import { WorkspaceDashboardComponent } from './pages/workspace-dashboard/workspace-dashboard.component';
import { StarredNotesComponent } from './pages/starred-notes/starred-notes.component';
import { SharedNotesComponent } from './pages/shared-notes/shared-notes.component';
import { RecentNotesComponent } from './pages/recent-notes/recent-notes.component';

@NgModule({
  declarations: [
    WorkspaceDashboardComponent,
    StarredNotesComponent,
    SharedNotesComponent,
    RecentNotesComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    DashboardRoutingModule
  ]
})
export class DashboardModule {}
