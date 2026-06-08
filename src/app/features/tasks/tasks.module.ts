import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { TasksRoutingModule } from './tasks-routing.module';

import { TaskDashboardComponent } from './pages/task-dashboard/task-dashboard.component';

import { TaskFormComponent } from './pages/task-form/task-form.component';

import { TaskDetailsComponent } from './pages/task-details/task-details.component';

@NgModule({
  declarations: [
    TaskDashboardComponent,
    TaskFormComponent,
    TaskDetailsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    TasksRoutingModule
  ]
})
export class TasksModule {}
