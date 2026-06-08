import { Injectable } from '@angular/core';

import { Workspace } from '../../features/workspaces/models/workspace.model';

export type WorkspaceRole = 'owner' | 'admin' | 'member';

@Injectable({
  providedIn: 'root'
})
export class WorkspaceRoleService {

  getRole(workspace: Workspace, userId: string): WorkspaceRole | null {

    if (!workspace.members?.includes(userId)) {
      return null;
    }

    if (workspace.ownerId === userId) {
      return 'owner';
    }

    if (workspace.admins?.includes(userId)) {
      return 'admin';
    }

    return 'member';
  }

  getRoleLabel(role: WorkspaceRole): string {

    const labels: Record<WorkspaceRole, string> = {
      owner: 'Owner',
      admin: 'Admin',
      member: 'Member'
    };

    return labels[role];
  }

  canManageWorkspace(workspace: Workspace, userId: string): boolean {
    const role = this.getRole(workspace, userId);
    return role === 'owner' || role === 'admin';
  }

  canManageMembers(workspace: Workspace, userId: string): boolean {
    return workspace.ownerId === userId;
  }

  canDeleteWorkspace(workspace: Workspace, userId: string): boolean {
    return workspace.ownerId === userId;
  }

  canEditContent(workspace: Workspace, userId: string): boolean {
    return this.getRole(workspace, userId) !== null;
  }
}
