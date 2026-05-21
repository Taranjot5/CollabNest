import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WorkspaceDashboardComponent } from './workspace-dashboard/workspace-dashboard.component';
import { authGuard } from '../../../core/guards/auth.guard';

const routes: Routes = [
  {
    path:'',
    component: WorkspaceDashboardComponent,
    canActivate: [authGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorkspaceRoutingModule { }
