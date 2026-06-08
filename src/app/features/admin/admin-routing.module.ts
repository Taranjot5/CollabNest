import { NgModule } from '@angular/core';

import { RouterModule, Routes } from '@angular/router';

import { UserListComponent } from './pages/user-list/user-list.component';

import { UserFormComponent } from './pages/user-form/user-form.component';

import { RolePermissionsComponent } from './pages/role-permissions/role-permissions.component';

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
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {}
