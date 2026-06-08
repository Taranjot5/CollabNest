export type UserRole = 'super_admin' | 'admin' | 'editor' | 'viewer';

/** Roles stored in Firestore (includes legacy display names). */
export type StoredUserRole =
  | 'super_admin'
  | 'admin'
  | 'senior'
  | 'junior'
  | 'member'
  | 'editor'
  | 'viewer';

export type UserStatus = 'active' | 'inactive';

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  editor: 'Editor',
  viewer: 'Viewer'
};

export const DISPLAY_ROLE_LABELS: Record<StoredUserRole, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  senior: 'Senior',
  junior: 'Junior',
  member: 'Member',
  editor: 'Editor',
  viewer: 'Viewer'
};

export const ASSIGNABLE_ROLES: StoredUserRole[] = [
  'admin',
  'senior',
  'junior',
  'member'
];

export interface AppUser {

  uid: string;

  email: string;

  name: string;

  role?: StoredUserRole | string;

  status?: UserStatus;

  workspaceIds?: string[];

  bio?: string;

  department?: string;

  designation?: string;

  createdAt?: number;

  updatedAt?: number;
}

export interface CreateUserPayload {

  name: string;

  email: string;

  password: string;

  role: StoredUserRole;

  department: string;

  designation: string;

  workspaceIds: string[];
}

export interface UpdateUserPayload {

  name: string;

  email: string;

  role: StoredUserRole;

  department: string;

  designation: string;

  workspaceIds: string[];

  status: UserStatus;
}
