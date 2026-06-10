import { Component, OnDestroy, OnInit } from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';

import { Subject } from 'rxjs';

import { takeUntil } from 'rxjs/operators';

import { AngularFireAuth } from '@angular/fire/compat/auth';

import { AuthService } from '../../../../core/services/auth.service';

import { TaskService } from '../../services/task.service';

import { TaskPermissionService } from '../../services/task-permission.service';

import { RolePermissionService } from '../../../../core/services/role-permission.service';

import { FileService } from '../../../../core/services/file.service';

import {
  Task,
  TaskStatus
} from '../../models/task.model';

import { TaskActivity } from '../../models/task-activity.model';

import { TaskComment } from '../../models/task-comment.model';

import { AppUser } from '../../../../models/user.model';

import { Attachment } from '../../../notes/models/attachment.model';

@Component({
  selector: 'app-task-details',
  templateUrl: './task-details.component.html',
  styleUrls: ['./task-details.component.scss']
})
export class TaskDetailsComponent implements OnInit, OnDestroy {

  taskId = '';

  task: Task | null = null;

  activities: TaskActivity[] = [];

  comments: TaskComment[] = [];

  userProfile: AppUser | null = null;

  canManageTasks = false;

  canUpdateProgress = false;

  canSetProgress = false;

  canSubmitReview = false;

  canReview = false;

  canComment = false;

  loading = true;

  progressPercent = 0;

  progressStatus: TaskStatus = 'pending';

  workUpdateText = '';

  progressCommentText = '';

  commentText = '';

  completionReportText = '';

  reviewNotes = '';

  reportAttachments: Attachment[] = [];

  progressAttachments: Attachment[] = [];

  saving = false;

  errorMessage = '';

  statusOptions: { value: TaskStatus; label: string }[] = [
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'under_review', label: 'Under Review' },
    { value: 'completed', label: 'Completed' }
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private taskService: TaskService,
    private authService: AuthService,
    private permissionService: TaskPermissionService,
    private rolePermission: RolePermissionService,
    private fileService: FileService,
    private afAuth: AngularFireAuth
  ) {}

  ngOnInit(): void {

    this.taskId = this.route.snapshot.paramMap.get('id') || '';

    this.afAuth.authState.pipe(takeUntil(this.destroy$)).subscribe(user => {

      if (!user) return;

      this.authService.getUserById(user.uid).pipe(
        takeUntil(this.destroy$)
      ).subscribe(profile => {

        this.userProfile = profile;
        this.canManageTasks = this.rolePermission.canManageTasks(profile);
        this.subscribeToTask();
        this.subscribeToActivities();
        this.subscribeToComments();
      });
    });
  }

  subscribeToTask(): void {

    this.taskService.getTaskById(this.taskId).pipe(
      takeUntil(this.destroy$)
    ).subscribe(task => {

      if (!task) {
        this.router.navigate(['/tasks']);
        return;
      }

      if (this.userProfile && !this.permissionService.canViewTask(this.userProfile, task)) {
        this.router.navigate(['/tasks']);
        return;
      }

      this.task = task;
      this.progressPercent = task.progressPercent;
      this.progressStatus = task.status;
      this.canSetProgress = this.userProfile
        ? this.permissionService.canSetTaskProgress(this.userProfile, task)
        : false;
      this.canUpdateProgress = this.canSetProgress
        && !this.canManageTasks
        && task.status !== 'under_review';
      this.canSubmitReview = this.userProfile
        ? this.permissionService.canSubmitForReview(this.userProfile, task)
        : false;
      this.canReview = this.userProfile
        ? this.permissionService.canReviewTask(this.userProfile, task)
        : false;
      this.canComment = this.userProfile
        ? this.permissionService.canComment(this.userProfile, task)
        : false;
      this.loading = false;
    });
  }

  subscribeToActivities(): void {

    this.taskService.getTaskActivities(this.taskId).pipe(
      takeUntil(this.destroy$)
    ).subscribe(activities => {
      this.activities = activities;
    });
  }

  subscribeToComments(): void {

    this.taskService.getTaskComments(this.taskId).pipe(
      takeUntil(this.destroy$)
    ).subscribe(comments => {
      this.comments = comments;
    });
  }

  editTask(): void {
    this.router.navigate(['/tasks', this.taskId, 'edit']);
  }

  async deleteTask(): Promise<void> {

    if (!this.userProfile || !confirm('Delete this task permanently?')) return;

    try {
      await this.taskService.deleteTask(this.taskId, this.userProfile);
      this.router.navigate(['/tasks']);
    } catch (err: any) {
      this.errorMessage = err.message;
    }
  }

  async saveProgress(): Promise<void> {

    if (!this.userProfile) return;

    this.saving = true;
    this.errorMessage = '';

    try {
      const payload: {
        status?: TaskStatus;
        progressPercent?: number;
        attachments?: Attachment[];
      } = {
        status: this.progressStatus,
        attachments: this.progressAttachments
      };

      if (!this.canManageTasks) {
        payload.progressPercent = this.progressPercent;
      }

      await this.taskService.updateProgress(
        this.taskId,
        payload,
        this.userProfile
      );

      this.progressAttachments = [];
    } catch (err: any) {
      this.errorMessage = err.message;
    } finally {
      this.saving = false;
    }
  }

  async addProgressComment(): Promise<void> {

    if (!this.userProfile || !this.progressCommentText.trim()) return;

    this.saving = true;
    this.errorMessage = '';

    try {
      await this.taskService.addComment(
        this.taskId,
        this.progressCommentText.trim(),
        this.userProfile,
        true
      );
      this.progressCommentText = '';
    } catch (err: any) {
      this.errorMessage = err.message;
    } finally {
      this.saving = false;
    }
  }

  async submitWorkUpdate(): Promise<void> {

    if (!this.userProfile || !this.workUpdateText.trim()) return;

    this.saving = true;

    try {
      await this.taskService.addComment(
        this.taskId,
        this.workUpdateText,
        this.userProfile,
        true
      );
      this.workUpdateText = '';
    } catch (err: any) {
      this.errorMessage = err.message;
    } finally {
      this.saving = false;
    }
  }

  async addComment(): Promise<void> {

    if (!this.userProfile || !this.commentText.trim()) return;

    this.saving = true;

    try {
      await this.taskService.addComment(
        this.taskId,
        this.commentText,
        this.userProfile,
        false
      );
      this.commentText = '';
    } catch (err: any) {
      this.errorMessage = err.message;
    } finally {
      this.saving = false;
    }
  }

  async onProgressFileSelected(event: Event): Promise<void> {

    const input = event.target as HTMLInputElement;

    if (!input.files?.length) return;

    try {
      const attachment = await this.fileService.uploadTaskFile(
        input.files[0],
        this.taskId
      );
      this.progressAttachments.push(attachment);
    } catch {
      this.errorMessage = 'Failed to upload file';
    }

    input.value = '';
  }

  async onReportFileSelected(event: Event): Promise<void> {

    const input = event.target as HTMLInputElement;

    if (!input.files?.length) return;

    try {
      const attachment = await this.fileService.uploadTaskFile(
        input.files[0],
        this.taskId
      );
      this.reportAttachments.push(attachment);
    } catch {
      this.errorMessage = 'Failed to upload file';
    }

    input.value = '';
  }

  async submitForReview(): Promise<void> {

    if (!this.userProfile || !this.completionReportText.trim()) {
      this.errorMessage = 'Completion report is required';
      return;
    }

    this.saving = true;
    this.errorMessage = '';

    try {
      await this.taskService.submitForReview(
        this.taskId,
        {
          text: this.completionReportText,
          submittedAt: Date.now(),
          submittedBy: this.userProfile.uid,
          attachments: this.reportAttachments
        },
        this.userProfile
      );

      this.completionReportText = '';
      this.reportAttachments = [];
    } catch (err: any) {
      this.errorMessage = err.message;
    } finally {
      this.saving = false;
    }
  }

  async reviewTask(status: 'approved' | 'rejected' | 'changes_requested'): Promise<void> {

    if (!this.userProfile) return;

    this.saving = true;
    this.errorMessage = '';

    try {
      await this.taskService.reviewTask(
        this.taskId,
        {
          status,
          notes: this.reviewNotes
        },
        this.userProfile
      );

      this.reviewNotes = '';
    } catch (err: any) {
      this.errorMessage = err.message;
    } finally {
      this.saving = false;
    }
  }

  getStatusLabel(status: TaskStatus): string {

    const labels: Record<TaskStatus, string> = {
      pending: 'Pending',
      in_progress: 'In Progress',
      under_review: 'Under Review',
      completed: 'Completed'
    };

    return labels[status];
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
