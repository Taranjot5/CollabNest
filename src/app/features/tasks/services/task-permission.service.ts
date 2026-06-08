import { Injectable } from '@angular/core';

import { Task } from '../models/task.model';

import { AppUser } from '../../../models/user.model';

import { RolePermissionService } from '../../../core/services/role-permission.service';

@Injectable({
  providedIn: 'root'
})
export class TaskPermissionService {

  constructor(
    private rolePermission: RolePermissionService
  ) {}

  canCreateTask(user?: AppUser | null): boolean {
    return this.rolePermission.canManageTasks(user);
  }

  canEditTask(user?: AppUser | null): boolean {
    return this.rolePermission.canManageTasks(user);
  }

  canAssignTask(user?: AppUser | null): boolean {
    return this.rolePermission.canManageTasks(user);
  }

  canDeleteTask(user?: AppUser | null): boolean {
    return this.rolePermission.canManageTasks(user);
  }

  canViewAllTasks(user?: AppUser | null): boolean {
    return this.rolePermission.canManageTasks(user);
  }

  canViewTask(user: AppUser, task: Task): boolean {

    if (this.rolePermission.canManageTasks(user)) {
      return true;
    }

    return task.assigneeIds.includes(user.uid);
  }

  canUpdateProgress(user: AppUser, task: Task): boolean {

    if (!this.rolePermission.isEditor(user)) {
      return false;
    }

    return task.assigneeIds.includes(user.uid)
      && task.status !== 'completed';
  }

  canSubmitForReview(user: AppUser, task: Task): boolean {

    return this.canUpdateProgress(user, task)
      && (task.status === 'in_progress' || task.status === 'pending');
  }

  canReviewTask(user: AppUser, task: Task): boolean {

    if (!this.rolePermission.canManageTasks(user)) {
      return false;
    }

    return task.status === 'under_review';
  }

  canComment(user: AppUser, task: Task): boolean {

    if (this.rolePermission.isViewer(user)) {
      return false;
    }

    if (this.rolePermission.canManageTasks(user)) {
      return true;
    }

    return this.rolePermission.isEditor(user)
      && task.assigneeIds.includes(user.uid);
  }
}
