import { Component } from '@angular/core';

import {
  PERMISSION_DEFINITIONS,
  ROLE_PERMISSIONS
} from '../../../../models/role-permissions.model';

import {
  DISPLAY_ROLE_LABELS,
  UserRole
} from '../../../../models/user.model';

@Component({
  selector: 'app-role-permissions',
  templateUrl: './role-permissions.component.html',
  styleUrls: ['./role-permissions.component.scss']
})
export class RolePermissionsComponent {

  permissions = PERMISSION_DEFINITIONS;

  roles: { key: UserRole; label: string }[] = [
    { key: 'super_admin', label: DISPLAY_ROLE_LABELS.super_admin },
    { key: 'admin', label: 'Admin / Senior' },
    { key: 'editor', label: 'Editor / Junior' },
    { key: 'viewer', label: 'Viewer / Member' }
  ];

  hasPermission(role: UserRole, permissionKey: string): boolean {
    return ROLE_PERMISSIONS[role].includes(permissionKey as any);
  }
}
