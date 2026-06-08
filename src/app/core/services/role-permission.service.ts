import { Injectable } from '@angular/core';

import {
  AppUser,
  UserRole,
  ROLE_LABELS,
  DISPLAY_ROLE_LABELS,
  StoredUserRole
} from '../../models/user.model';

import {
  AppPermission,
  ROLE_PERMISSIONS
} from '../../models/role-permissions.model';

@Injectable({
  providedIn: 'root'
})
export class RolePermissionService {

  /** Maps stored role values to the normalized 4-role permission model. */
  normalizeRole(role?: string | null): UserRole {

    const legacyMap: Record<string, UserRole> = {
      super_admin: 'super_admin',
      admin: 'admin',
      editor: 'editor',
      viewer: 'viewer',
      senior: 'admin',
      junior: 'editor',
      member: 'viewer'
    };

    return legacyMap[role || ''] || 'viewer';
  }

  getRole(user?: AppUser | null): UserRole {
    return this.normalizeRole(user?.role);
  }

  getRoleLabel(user?: AppUser | null): string {

    const stored = user?.role as StoredUserRole | undefined;

    if (stored && DISPLAY_ROLE_LABELS[stored]) {
      return DISPLAY_ROLE_LABELS[stored];
    }

    return ROLE_LABELS[this.getRole(user)];
  }

  getPermissions(user?: AppUser | null): AppPermission[] {
    return ROLE_PERMISSIONS[this.getRole(user)];
  }

  hasPermission(
    user: AppUser | null | undefined,
    permission: AppPermission
  ): boolean {
    return this.getPermissions(user).includes(permission);
  }

  canAccessRoute(
    user: AppUser | null | undefined,
    routePath: string
  ): boolean {

    if (routePath.startsWith('/admin')) {
      return this.hasPermission(user, 'admin.users');
    }

    if (routePath.startsWith('/notes/trash')) {
      return this.hasPermission(user, 'trash');
    }

    if (routePath.startsWith('/tasks/new')
      || routePath.includes('/edit')) {
      return this.hasPermission(user, 'tasks.manage');
    }

    if (routePath.startsWith('/tasks')) {
      return this.hasPermission(user, 'tasks');
    }

    if (routePath.startsWith('/workspaces')) {
      return this.hasPermission(user, 'workspaces');
    }

    if (routePath.startsWith('/notes')) {
      return this.hasPermission(user, 'notes');
    }

    if (routePath.startsWith('/notifications')) {
      return this.hasPermission(user, 'notifications');
    }

    if (routePath.startsWith('/dashboard')) {
      return this.hasPermission(user, 'dashboard');
    }

    return true;
  }

  isSuperAdmin(user?: AppUser | null): boolean {
    return this.getRole(user) === 'super_admin';
  }

  isAdmin(user?: AppUser | null): boolean {
    const role = this.getRole(user);
    return role === 'super_admin' || role === 'admin';
  }

  isEditor(user?: AppUser | null): boolean {
    return this.getRole(user) === 'editor';
  }

  isViewer(user?: AppUser | null): boolean {
    return this.getRole(user) === 'viewer';
  }

  isActive(user?: AppUser | null): boolean {
    return user?.status !== 'inactive';
  }

  /** Super Admin + Admin — full task management */
  canManageTasks(user?: AppUser | null): boolean {
    return this.hasPermission(user, 'tasks.manage');
  }

  /** Users who can be assigned tasks */
  isAssignableRole(role?: string | null): boolean {
    const normalized = this.normalizeRole(role);
    return normalized === 'editor' || normalized === 'viewer';
  }
}
