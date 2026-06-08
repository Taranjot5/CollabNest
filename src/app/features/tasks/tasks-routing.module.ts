import { NgModule } from '@angular/core';

import { RouterModule, Routes } from '@angular/router';

import { taskManagerGuard } from '../../core/guards/task-manager.guard';

import { TaskDashboardComponent } from './pages/task-dashboard/task-dashboard.component';

import { TaskFormComponent } from './pages/task-form/task-form.component';

import { TaskDetailsComponent } from './pages/task-details/task-details.component';

const routes: Routes = [

  {
    path: '',
    component: TaskDashboardComponent
  },

  {
    path: 'new',
    component: TaskFormComponent,
    canActivate: [taskManagerGuard]
  },

  {
    path: ':id/edit',
    component: TaskFormComponent,
    canActivate: [taskManagerGuard]
  },

  {
    path: ':id',
    component: TaskDetailsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TasksRoutingModule {}
