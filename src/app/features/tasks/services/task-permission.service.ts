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

  isTaskAssignee(user: AppUser, task: Task): boolean {
    return task.assigneeIds.includes(user.uid);
  }

  canUpdateProgress(user: AppUser, task: Task): boolean {

    if (this.rolePermission.canManageTasks(user)) {
      return true;
    }

    return this.isTaskAssignee(user, task)
      && task.status !== 'completed';
  }

  canSetTaskProgress(user: AppUser, task: Task): boolean {
    return this.canUpdateProgress(user, task);
  }

  canSubmitForReview(user: AppUser, task: Task): boolean {

    if (this.rolePermission.canManageTasks(user)) {
      return false;
    }

    return this.isTaskAssignee(user, task)
      && (task.status === 'in_progress' || task.status === 'pending');
  }

  canReviewTask(user: AppUser, task: Task): boolean {

    if (!this.rolePermission.canManageTasks(user)) {
      return false;
    }

    return task.status === 'under_review';
  }

  canComment(user: AppUser, task: Task): boolean {

    if (this.rolePermission.canManageTasks(user)) {
      return true;
    }

    return this.isTaskAssignee(user, task);
  }
}
