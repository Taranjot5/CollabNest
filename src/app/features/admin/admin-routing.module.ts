import { NgModule } from '@angular/core';

import { RouterModule, Routes } from '@angular/router';

import { UserListComponent } from './pages/user-list/user-list.component';

import { UserFormComponent } from './pages/user-form/user-form.component';

import { RolePermissionsComponent } from './pages/role-permissions/role-permissions.component';

import { AuditLogsComponent } from './pages/audit-logs/audit-logs.component';

const routes: Routes = [

  {
    path: '',
    redirectTo: 'users',
    pathMatch: 'full'
  },

  {
    path: 'users',
    component: UserListComponent
  },

  {
    path: 'users/new',
    component: UserFormComponent
  },

  {
    path: 'users/:id/edit',
    component: UserFormComponent
  },

  {
    path: 'roles',
    component: RolePermissionsComponent
  },

  {
    path: 'audit-logs',
    component: AuditLogsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {}
