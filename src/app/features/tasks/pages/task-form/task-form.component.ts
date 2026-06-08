import { Component, OnInit } from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';

import { AngularFireAuth } from '@angular/fire/compat/auth';

import { take } from 'rxjs/operators';

import { AuthService } from '../../../../core/services/auth.service';

import { TaskService } from '../../services/task.service';

import { FileService } from '../../../../core/services/file.service';

import { TaskPriority } from '../../models/task.model';

import { AppUser } from '../../../../models/user.model';

import { RolePermissionService } from '../../../../core/services/role-permission.service';

import { Attachment } from '../../../notes/models/attachment.model';

@Component({
  selector: 'app-task-form',
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.component.scss']
})
export class TaskFormComponent implements OnInit {

  isEdit = false;

  taskId = '';

  title = '';

  description = '';

  priority: TaskPriority = 'Medium';

  dueDate = '';

  selectedAssignees: string[] = [];

  assignableUsers: AppUser[] = [];

  attachments: Attachment[] = [];

  userProfile: AppUser | null = null;

  loading = false;

  saving = false;

  errorMessage = '';

  constructor(
    private taskService: TaskService,
    private authService: AuthService,
    private fileService: FileService,
    private afAuth: AngularFireAuth,
    private route: ActivatedRoute,
    private router: Router,
    private rolePermission: RolePermissionService
  ) {}

  getUserRoleLabel(user: AppUser): string {
    return this.rolePermission.getRoleLabel(user);
  }

  ngOnInit(): void {

    this.taskId = this.route.snapshot.paramMap.get('id') || '';
    this.isEdit = !!this.taskId;

    this.afAuth.authState.pipe(take(1)).subscribe(user => {

      if (!user) return;

      this.authService.getUserById(user.uid).pipe(take(1)).subscribe(profile => {
        this.userProfile = profile;
      });
    });

    this.taskService.getAssignableUsers().subscribe(users => {
      this.assignableUsers = users;
    });

    if (this.isEdit) {
      this.loadTask();
    }
  }

  loadTask(): void {

    this.loading = true;

    this.taskService.getTaskById(this.taskId).pipe(take(1)).subscribe(task => {

      if (!task) {
        this.router.navigate(['/tasks']);
        return;
      }

      this.title = task.title;
      this.description = task.description;
      this.priority = task.priority;
      this.dueDate = this.toDateInput(task.dueDate);
      this.selectedAssignees = [...task.assigneeIds];
      this.attachments = task.attachments || [];
      this.loading = false;
    });
  }

  toggleAssignee(uid: string): void {

    const idx = this.selectedAssignees.indexOf(uid);

    if (idx >= 0) {
      this.selectedAssignees.splice(idx, 1);
    } else {
      this.selectedAssignees.push(uid);
    }
  }

  isAssigneeSelected(uid: string): boolean {
    return this.selectedAssignees.includes(uid);
  }

  async onFileSelected(event: Event): Promise<void> {

    const input = event.target as HTMLInputElement;

    if (!input.files?.length) return;

    const file = input.files[0];
    const uploadId = this.taskId || 'new';

    try {
      const attachment = await this.fileService.uploadTaskFile(file, uploadId);
      this.attachments.push(attachment);
    } catch {
      this.errorMessage = 'Failed to upload file';
    }

    input.value = '';
  }

  removeAttachment(index: number): void {
    this.attachments.splice(index, 1);
  }

  async save(): Promise<void> {

    if (!this.title.trim() || !this.userProfile) {
      this.errorMessage = 'Title is required';
      return;
    }

    if (!this.selectedAssignees.length) {
      this.errorMessage = 'Select at least one assignee';
      return;
    }

    this.saving = true;
    this.errorMessage = '';

    const dueDateMs = this.dueDate
      ? new Date(this.dueDate).getTime()
      : Date.now() + 7 * 86400000;

    try {

      if (this.isEdit) {
        await this.taskService.updateTask(
          this.taskId,
          {
            title: this.title,
            description: this.description,
            priority: this.priority,
            dueDate: dueDateMs,
            assigneeIds: this.selectedAssignees,
            attachments: this.attachments
          },
          this.userProfile
        );

        this.router.navigate(['/tasks', this.taskId]);
      } else {
        const id = await this.taskService.createTask(
          {
            title: this.title,
            description: this.description,
            priority: this.priority,
            dueDate: dueDateMs,
            assigneeIds: this.selectedAssignees,
            attachments: this.attachments
          },
          this.userProfile
        );

        this.router.navigate(['/tasks', id]);
      }

    } catch (err: any) {
      this.errorMessage = err.message || 'Failed to save task';
    } finally {
      this.saving = false;
    }
  }

  cancel(): void {

    if (this.isEdit) {
      this.router.navigate(['/tasks', this.taskId]);
    } else {
      this.router.navigate(['/tasks']);
    }
  }

  private toDateInput(timestamp: number): string {

    const d = new Date(timestamp);
    return d.toISOString().split('T')[0];
  }
}
