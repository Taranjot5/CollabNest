import { UserRole } from './user.model';

export type AppPermission =
  | 'dashboard'
  | 'notes'
  | 'workspaces'
  | 'tasks'
  | 'tasks.manage'
  | 'notifications'
  | 'trash'
  | 'admin.users';

export interface PermissionDefinition {

  key: AppPermission;

  label: string;

  description: string;
}

export const PERMISSION_DEFINITIONS: PermissionDefinition[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    description: 'View dashboard and note collections'
  },
  {
    key: 'notes',
    label: 'Notes',
    description: 'Create, edit, and manage notes'
  },
  {
    key: 'workspaces',
    label: 'Workspaces',
    description: 'Access and collaborate in workspaces'
  },
  {
    key: 'tasks',
    label: 'Tasks',
    description: 'View assigned tasks and update progress'
  },
  {
    key: 'tasks.manage',
    label: 'Manage Tasks',
    description: 'Create, assign, edit, and delete tasks'
  },
  {
    key: 'notifications',
    label: 'Notifications',
    description: 'View system notifications'
  },
  {
    key: 'trash',
    label: 'Trash',
    description: 'Access deleted notes'
  },
  {
    key: 'admin.users',
    label: 'User Management',
    description: 'Create and manage users, roles, and access'
  }
];

export const ROLE_PERMISSIONS: Record<UserRole, AppPermission[]> = {
  super_admin: [
    'dashboard',
    'notes',
    'workspaces',
    'tasks',
    'tasks.manage',
    'notifications',
    'trash',
    'admin.users'
  ],
  admin: [
    'dashboard',
    'notes',
    'workspaces',
    'tasks',
    'tasks.manage',
    'notifications',
    'trash'
  ],
  editor: [
    'dashboard',
    'notes',
    'workspaces',
    'tasks',
    'notifications'
  ],
  viewer: [
    'dashboard',
    'notes',
    'workspaces',
    'tasks',
    'notifications'
  ]
};

export const ROUTE_PERMISSION_MAP: Record<string, AppPermission> = {
  '/dashboard': 'dashboard',
  '/notes': 'notes',
  '/workspaces': 'workspaces',
  '/tasks': 'tasks',
  '/notifications': 'notifications',
  '/admin': 'admin.users'
};
