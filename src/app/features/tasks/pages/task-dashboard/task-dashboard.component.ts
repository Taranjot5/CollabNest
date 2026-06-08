import { Component, OnDestroy, OnInit } from '@angular/core';

import { Router } from '@angular/router';

import { Subject } from 'rxjs';

import { takeUntil } from 'rxjs/operators';

import { AngularFireAuth } from '@angular/fire/compat/auth';

import { AuthService } from '../../../../core/services/auth.service';

import { TaskService } from '../../services/task.service';

import { RolePermissionService } from '../../../../core/services/role-permission.service';

import { Task, TaskStatus, TaskPriority } from '../../models/task.model';

import { AppUser } from '../../../../models/user.model';

@Component({
  selector: 'app-task-dashboard',
  templateUrl: './task-dashboard.component.html',
  styleUrls: ['./task-dashboard.component.scss']
})
export class TaskDashboardComponent implements OnInit, OnDestroy {

  tasks: Task[] = [];

  filteredTasks: Task[] = [];

  userProfile: AppUser | null = null;

  canManageTasks = false;

  roleLabel = '';

  loading = true;

  searchText = '';

  statusFilter: TaskStatus | 'all' = 'all';

  priorityFilter: TaskPriority | 'all' = 'all';

  dueDateFilter: 'all' | 'overdue' | 'today' | 'week' = 'all';

  counters = {
    pending: 0,
    in_progress: 0,
    under_review: 0,
    completed: 0,
    total: 0
  };

  statusOptions: { value: TaskStatus | 'all'; label: string }[] = [
    { value: 'all', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'under_review', label: 'Under Review' },
    { value: 'completed', label: 'Completed' }
  ];

  priorityOptions: { value: TaskPriority | 'all'; label: string }[] = [
    { value: 'all', label: 'All Priorities' },
    { value: 'High', label: 'High' },
    { value: 'Medium', label: 'Medium' },
    { value: 'Low', label: 'Low' }
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private taskService: TaskService,
    private authService: AuthService,
    private rolePermission: RolePermissionService,
    private afAuth: AngularFireAuth,
    private router: Router
  ) {}

  ngOnInit(): void {

    this.afAuth.authState.pipe(
      takeUntil(this.destroy$)
    ).subscribe(user => {

      if (!user) return;

      this.authService.getUserById(user.uid).pipe(
        takeUntil(this.destroy$)
      ).subscribe(profile => {

        this.userProfile = profile;
        this.canManageTasks = this.rolePermission.canManageTasks(profile);
        this.roleLabel = this.rolePermission.getRoleLabel(profile);
        this.subscribeToTasks(profile);
      });
    });
  }

  subscribeToTasks(profile: AppUser): void {

    this.taskService.getTasks(profile).pipe(
      takeUntil(this.destroy$)
    ).subscribe(tasks => {

      this.tasks = tasks;
      this.updateCounters();
      this.applyFilters();
      this.loading = false;
    });
  }

  updateCounters(): void {

    this.counters = {
      pending: this.tasks.filter(t => t.status === 'pending').length,
      in_progress: this.tasks.filter(t => t.status === 'in_progress').length,
      under_review: this.tasks.filter(t => t.status === 'under_review').length,
      completed: this.tasks.filter(t => t.status === 'completed').length,
      total: this.tasks.length
    };
  }

  applyFilters(): void {

    let result = [...this.tasks];

    if (this.statusFilter !== 'all') {
      result = result.filter(t => t.status === this.statusFilter);
    }

    if (this.priorityFilter !== 'all') {
      result = result.filter(t => t.priority === this.priorityFilter);
    }

    if (this.dueDateFilter !== 'all') {
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      const endOfToday = startOfToday + 86400000;
      const endOfWeek = startOfToday + 7 * 86400000;

      result = result.filter(t => {

        if (!t.dueDate) return false;

        if (this.dueDateFilter === 'overdue') {
          return t.dueDate < startOfToday && t.status !== 'completed';
        }

        if (this.dueDateFilter === 'today') {
          return t.dueDate >= startOfToday && t.dueDate < endOfToday;
        }

        return t.dueDate >= startOfToday && t.dueDate < endOfWeek;
      });
    }

    if (this.searchText.trim()) {
      const q = this.searchText.toLowerCase();
      result = result.filter(t =>
        t.title.toLowerCase().includes(q)
        || t.description.toLowerCase().includes(q)
        || t.assigneeNames?.some(n => n.toLowerCase().includes(q))
      );
    }

    this.filteredTasks = result;
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  openTask(id?: string): void {

    if (!id) return;

    this.router.navigate(['/tasks', id]);
  }

  createTask(): void {
    this.router.navigate(['/tasks/new']);
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

  isOverdue(task: Task): boolean {

    if (!task.dueDate || task.status === 'completed') return false;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    return task.dueDate < startOfToday.getTime();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
