import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import { RouterModule } from '@angular/router';

import { MatIconModule } from '@angular/material/icon';

import { MatButtonModule } from '@angular/material/button';

import { AdminRoutingModule } from './admin-routing.module';

import { UserListComponent } from './pages/user-list/user-list.component';

import { UserFormComponent } from './pages/user-form/user-form.component';

import { RolePermissionsComponent } from './pages/role-permissions/role-permissions.component';

@NgModule({
  declarations: [
    UserListComponent,
    UserFormComponent,
    RolePermissionsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    AdminRoutingModule
  ]
})
export class AdminModule {}
