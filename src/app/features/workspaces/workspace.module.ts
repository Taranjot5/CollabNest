import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import {
  WorkspaceRoutingModule
} from './workspace-routing.module';

import {
  WorkspaceListComponent
} from './pages/workspace-list/workspace-list.component';
import { WorkspaceDetailsComponent } from './pages/workspace-details/workspace-details.component';
import { ActivityHistoryComponent } from './pages/activity-history/activity-history.component';

@NgModule({

  declarations: [
    WorkspaceListComponent,
    WorkspaceDetailsComponent,
    ActivityHistoryComponent
  ],

  imports: [

    CommonModule,

    FormsModule,

    WorkspaceRoutingModule
  ]
})

export class WorkspaceModule {}