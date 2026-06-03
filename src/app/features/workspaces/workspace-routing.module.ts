import { NgModule } from '@angular/core';

import {
  RouterModule,
  Routes
} from '@angular/router';

import {
  WorkspaceListComponent
} from './pages/workspace-list/workspace-list.component';

import {
  WorkspaceDetailsComponent
} from './pages/workspace-details/workspace-details.component';

const routes: Routes = [

  {
    path: '',
    component: WorkspaceListComponent
  },

  {
    path: ':id',
    component: WorkspaceDetailsComponent
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

export class WorkspaceRoutingModule {}