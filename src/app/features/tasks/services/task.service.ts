import { Injectable } from '@angular/core';

import { AngularFirestore } from '@angular/fire/compat/firestore';

import { AngularFireAuth } from '@angular/fire/compat/auth';

import { Observable, of, switchMap, take } from 'rxjs';

import { map } from 'rxjs/operators';

import firebase from 'firebase/compat/app';

import { Attachment } from '../../notes/models/attachment.model';

import { NotificationService } from '../../../core/services/notification.service';

import { AuthService } from '../../../core/services/auth.service';

import { TaskPermissionService } from './task-permission.service';

import { RolePermissionService } from '../../../core/services/role-permission.service';

import {
  Task,
  TaskStatus,
  TaskPriority,
  CompletionReport,
  TaskReview
} from '../models/task.model';

import { TaskActivity } from '../models/task-activity.model';

import { TaskComment } from '../models/task-comment.model';

import { AppUser } from '../../../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  constructor(
    private firestore: AngularFirestore,
    private afAuth: AngularFireAuth,
    private notificationService: NotificationService,
    private authService: AuthService,
    private permissionService: TaskPermissionService,
    private rolePermission: RolePermissionService
  ) {}

  // =========================
  // GET TASKS (REAL-TIME)
  // =========================

  getTasks(userProfile: AppUser): Observable<Task[]> {

    return this.afAuth.authState.pipe(

      switchMap(user => {

        if (!user) return of([]);

        const canViewAll = this.permissionService.canViewAllTasks(userProfile);

        return this.firestore
          .collection<Task>('tasks', ref => {

            let query: firebase.firestore.Query = ref
              .orderBy('updatedAt', 'desc');

            if (!canViewAll) {
              query = query.where(
                'assigneeIds',
                'array-contains',
                user.uid
              );
            }

            return query;
          })
          .snapshotChanges()
          .pipe(
            map(actions =>
              actions.map(a => ({
                id: a.payload.doc.id,
                ...(a.payload.doc.data() as Task)
              }))
            )
          );
      })
    );
  }

  // =========================
  // GET SINGLE TASK (REAL-TIME)
  // =========================

  getTaskById(id: string): Observable<Task | undefined> {

    return this.firestore
      .collection('tasks')
      .doc<Task>(id)
      .valueChanges({ idField: 'id' });
  }

  // =========================
  // GET ACTIVITIES (REAL-TIME)
  // =========================

  getTaskActivities(taskId: string): Observable<TaskActivity[]> {

    return this.firestore
      .collection<TaskActivity>('taskActivities', ref =>
        ref
          .where('taskId', '==', taskId)
          .orderBy('createdAt', 'desc')
      )
      .snapshotChanges()
      .pipe(
        map(actions =>
          actions.map(a => ({
            id: a.payload.doc.id,
            ...(a.payload.doc.data() as TaskActivity)
          }))
        )
      );
  }

  // =========================
  // GET COMMENTS (REAL-TIME)
  // =========================

  getTaskComments(taskId: string): Observable<TaskComment[]> {

    return this.firestore
      .collection<TaskComment>('taskComments', ref =>
        ref.where('taskId', '==', taskId)
      )
      .snapshotChanges()
      .pipe(
        map(actions =>
          actions.map(a => ({
            id: a.payload.doc.id,
            ...(a.payload.doc.data() as TaskComment)
          }))
        ),
        map(comments =>
          comments.sort((a, b) => b.createdAt - a.createdAt)
        )
      );
  }

  // =========================
  // GET ASSIGNABLE USERS
  // =========================

  getAssignableUsers(): Observable<AppUser[]> {

    return this.firestore
      .collection<AppUser>('users')
      .valueChanges({ idField: 'uid' })
      .pipe(
        map(users =>
          users.filter(u =>
            this.rolePermission.isAssignableRole(u.role)
          )
        )
      );
  }

  // =========================
  // CREATE TASK
  // =========================

  async createTask(
    data: {
      title: string;
      description: string;
      priority: TaskPriority;
      dueDate: number;
      assigneeIds: string[];
      workspaceId?: string;
      attachments?: Attachment[];
    },
    creator: AppUser
  ): Promise<string | void> {

    if (!this.permissionService.canCreateTask(creator)) {
      throw new Error('Only Super Admin or Admin can create tasks');
    }

    const participants = [
      creator.uid,
      ...data.assigneeIds
    ];

    const uniqueParticipants = [...new Set(participants)];

    const assigneeNames = await this.resolveUserNames(data.assigneeIds);

    const task: Task = {
      title: data.title,
      description: data.description,
      priority: data.priority,
      status: 'pending',
      dueDate: data.dueDate,
      progressPercent: 0,
      createdBy: creator.uid,
      createdByName: creator.name,
      assigneeIds: data.assigneeIds,
      assigneeNames,
      participants: uniqueParticipants,
      workspaceId: data.workspaceId || '',
      attachments: data.attachments || [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    const docRef = await this.firestore
      .collection('tasks')
      .add(task);

    await this.logActivity(
      docRef.id,
      creator.uid,
      creator.name,
      'task_created',
      `Task "${data.title}" was created`
    );

    for (const assigneeId of data.assigneeIds) {

      await this.notificationService.createNotification(
        'New Task Assigned',
        `${creator.name} assigned you "${data.title}"`,
        'task_assigned',
        assigneeId
      );
    }

    return docRef.id;
  }

  // =========================
  // UPDATE TASK (SENIOR)
  // =========================

  async updateTask(
    taskId: string,
    updates: Partial<Task>,
    editor: AppUser
  ): Promise<void> {

    if (!this.permissionService.canEditTask(editor)) {
      throw new Error('Only Super Admin or Admin can edit tasks');
    }

    const payload: Partial<Task> = {
      ...updates,
      updatedAt: Date.now()
    };

    if (updates.assigneeIds) {
      payload.participants = [
        ...new Set([
          editor.uid,
          ...updates.assigneeIds
        ])
      ];
      payload.assigneeNames = await this.resolveUserNames(updates.assigneeIds);
    }

    await this.firestore
      .collection('tasks')
      .doc(taskId)
      .update(payload);

    await this.logActivity(
      taskId,
      editor.uid,
      editor.name,
      'task_updated',
      `Task was updated by ${editor.name}`
    );

    if (updates.assigneeIds) {

      const task = await this.getTaskSnapshot(taskId);
      const previousAssignees = task?.assigneeIds || [];

      for (const assigneeId of updates.assigneeIds) {

        if (previousAssignees.includes(assigneeId)) continue;

        await this.notificationService.createNotification(
          'Task Assigned',
          `${editor.name} assigned you "${task?.title}"`,
          'task_assigned',
          assigneeId
        );
      }
    }
  }

  // =========================
  // UPDATE PROGRESS (JUNIOR)
  // =========================

  async updateProgress(
    taskId: string,
    data: {
      status?: TaskStatus;
      progressPercent?: number;
      attachments?: Attachment[];
    },
    user: AppUser
  ): Promise<void> {

    const task = await this.getTaskSnapshot(taskId);

    if (!task || !this.permissionService.canSetTaskProgress(user, task)) {
      throw new Error('You cannot update this task');
    }

    const updateData: Partial<Task> = {
      updatedAt: Date.now()
    };

    if (data.status) updateData.status = data.status;
    if (data.progressPercent !== undefined) {
      updateData.progressPercent = data.progressPercent;
    }

    if (data.attachments?.length) {
      updateData.attachments = firebase.firestore.FieldValue.arrayUnion(
        ...data.attachments
      ) as unknown as Attachment[];
    }

    await this.firestore
      .collection('tasks')
      .doc(taskId)
      .update(updateData);

    await this.logActivity(
      taskId,
      user.uid,
      user.name,
      'progress_updated',
      `Progress updated to ${data.progressPercent ?? task.progressPercent}%`
    );

    await this.notificationService.createNotification(
      'Task Progress Updated',
      `${user.name} updated progress on "${task.title}"`,
      'task_update',
      task.createdBy
    );
  }

  // =========================
  // SUBMIT FOR REVIEW (JUNIOR)
  // =========================

  async submitForReview(
    taskId: string,
    report: CompletionReport,
    user: AppUser
  ): Promise<void> {

    const task = await this.getTaskSnapshot(taskId);

    if (!task || !this.permissionService.canSubmitForReview(user, task)) {
      throw new Error('You cannot submit this task for review');
    }

    await this.firestore
      .collection('tasks')
      .doc(taskId)
      .update({
        status: 'under_review',
        progressPercent: 100,
        completionReport: report,
        updatedAt: Date.now()
      });

    await this.logActivity(
      taskId,
      user.uid,
      user.name,
      'submitted_for_review',
      `${user.name} submitted completion report for review`
    );

    await this.notificationService.createNotification(
      'Task Submitted for Review',
      `${user.name} submitted "${task.title}" for your review`,
      'task_submission',
      task.createdBy
    );
  }

  // =========================
  // REVIEW TASK (SENIOR)
  // =========================

  async reviewTask(
    taskId: string,
    review: Omit<TaskReview, 'reviewedAt' | 'reviewedBy'>,
    reviewer: AppUser
  ): Promise<void> {

    const task = await this.getTaskSnapshot(taskId);

    if (!task || !this.permissionService.canReviewTask(reviewer, task)) {
      throw new Error('You cannot review this task');
    }

    const fullReview: TaskReview = {
      ...review,
      reviewedBy: reviewer.uid,
      reviewedAt: Date.now()
    };

    let newStatus: TaskStatus = 'in_progress';
    let notifyTitle = 'Task Review Update';
    let notifyMessage = '';
    let notifyType = 'task_review';

    if (review.status === 'approved') {
      newStatus = 'completed';
      notifyTitle = 'Task Approved';
      notifyMessage = `${reviewer.name} approved "${task.title}"`;
      notifyType = 'task_approved';
    } else if (review.status === 'rejected') {
      newStatus = 'in_progress';
      notifyTitle = 'Task Rejected';
      notifyMessage = `${reviewer.name} rejected "${task.title}" — sent back to In Progress`;
      notifyType = 'task_rejected';
    } else {
      newStatus = 'in_progress';
      notifyTitle = 'Changes Requested';
      notifyMessage = `${reviewer.name} requested changes on "${task.title}"`;
      notifyType = 'task_changes_requested';
    }

    await this.firestore
      .collection('tasks')
      .doc(taskId)
      .update({
        status: newStatus,
        lastReview: fullReview,
        progressPercent: review.status === 'approved'
          ? 100
          : Math.min(task.progressPercent, 90),
        updatedAt: Date.now()
      });

    await this.logActivity(
      taskId,
      reviewer.uid,
      reviewer.name,
      `review_${review.status}`,
      notifyMessage
    );

    for (const assigneeId of task.assigneeIds) {
      await this.notificationService.createNotification(
        notifyTitle,
        notifyMessage,
        notifyType,
        assigneeId
      );
    }
  }

  // =========================
  // ADD COMMENT
  // =========================

  async addComment(
    taskId: string,
    message: string,
    user: AppUser,
    isWorkUpdate = false
  ): Promise<void> {

    const task = await this.getTaskSnapshot(taskId);

    if (!task || !this.permissionService.canComment(user, task)) {
      throw new Error('You do not have permission to comment on this task');
    }

    const comment: TaskComment = {
      taskId,
      userId: user.uid,
      userName: user.name,
      message,
      isWorkUpdate,
      createdAt: Date.now()
    };

    await this.firestore
      .collection('taskComments')
      .add(comment);

    await this.logActivity(
      taskId,
      user.uid,
      user.name,
      isWorkUpdate ? 'work_update' : 'comment_added',
      isWorkUpdate
        ? `${user.name} added a work update`
        : `${user.name} commented on the task`
    );

    const notifyIds = new Set([
      task.createdBy,
      ...task.assigneeIds
    ]);

    notifyIds.delete(user.uid);

    for (const receiverId of notifyIds) {
      await this.notificationService.createNotification(
        isWorkUpdate ? 'Work Update' : 'New Comment',
        `${user.name} on "${task.title}": ${message.substring(0, 80)}`,
        'task_comment',
        receiverId
      );
    }
  }

  // =========================
  // DELETE TASK (SENIOR)
  // =========================

  async deleteTask(taskId: string, user: AppUser): Promise<void> {

    if (!this.permissionService.canEditTask(user)) {
      throw new Error('Only Super Admin or Admin can delete tasks');
    }

    await this.firestore
      .collection('tasks')
      .doc(taskId)
      .delete();
  }

  // =========================
  // HELPERS
  // =========================

  private async getTaskSnapshot(taskId: string): Promise<Task | null> {

    const snap = await this.firestore
      .collection('tasks')
      .doc(taskId)
      .ref
      .get();

    if (!snap.exists) return null;

    return { id: snap.id, ...(snap.data() as Task) };
  }

  private async resolveUserNames(uids: string[]): Promise<string[]> {

    const names: string[] = [];

    for (const uid of uids) {
      const user = await this.authService
        .getUserById(uid)
        .pipe(take(1))
        .toPromise();
      names.push(user?.name || uid);
    }

    return names;
  }

  private async logActivity(
    taskId: string,
    userId: string,
    userName: string | undefined,
    action: string,
    message: string
  ): Promise<void> {

    const activity: TaskActivity = {
      taskId,
      userId,
      userName,
      action,
      message,
      createdAt: Date.now()
    };

    await this.firestore
      .collection('taskActivities')
      .add(activity);
  }
}
