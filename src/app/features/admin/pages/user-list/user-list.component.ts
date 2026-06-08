import { Component, OnDestroy, OnInit } from '@angular/core';

import { Router } from '@angular/router';

import { Subject } from 'rxjs';

import { takeUntil } from 'rxjs/operators';

import { UserManagementService } from '../../../../core/services/user-management.service';

import { RolePermissionService } from '../../../../core/services/role-permission.service';

import { WorkspaceService } from '../../../workspaces/services/workspace.service';

import {
  AppUser,
  StoredUserRole,
  UserStatus
} from '../../../../models/user.model';

import { Workspace } from '../../../workspaces/models/workspace.model';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit, OnDestroy {

  users: AppUser[] = [];

  filteredUsers: AppUser[] = [];

  paginatedUsers: AppUser[] = [];

  workspaces: Workspace[] = [];

  workspaceMap: Record<string, string> = {};

  loading = true;

  searchText = '';

  roleFilter: StoredUserRole | 'all' = 'all';

  statusFilter: UserStatus | 'all' = 'all';

  workspaceFilter = 'all';

  currentPage = 1;

  pageSize = 10;

  totalPages = 1;

  actionLoading: string | null = null;

  counters = {
    total: 0,
    active: 0,
    inactive: 0,
    super_admin: 0,
    admin: 0,
    senior: 0,
    junior: 0,
    member: 0
  };

  roleOptions: { value: StoredUserRole | 'all'; label: string }[] = [
    { value: 'all', label: 'All Roles' },
    { value: 'super_admin', label: 'Super Admin' },
    { value: 'admin', label: 'Admin' },
    { value: 'senior', label: 'Senior' },
    { value: 'junior', label: 'Junior' },
    { value: 'member', label: 'Member' }
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private userManagement: UserManagementService,
    private rolePermission: RolePermissionService,
    private workspaceService: WorkspaceService,
    private router: Router
  ) {}

  ngOnInit(): void {

    this.workspaceService.getAllWorkspaces().pipe(
      takeUntil(this.destroy$)
    ).subscribe(workspaces => {
      this.workspaces = workspaces;
      this.workspaceMap = workspaces.reduce((acc, ws) => {
        if (ws.id) acc[ws.id] = ws.name;
        return acc;
      }, {} as Record<string, string>);
    });

    this.userManagement.getUsers().pipe(
      takeUntil(this.destroy$)
    ).subscribe(users => {
      this.users = users;
      this.updateCounters();
      this.applyFilters();
      this.loading = false;
    });
  }

  updateCounters(): void {

    this.counters = {
      total: this.users.length,
      active: this.users.filter(u => u.status !== 'inactive').length,
      inactive: this.users.filter(u => u.status === 'inactive').length,
      super_admin: this.users.filter(u => u.role === 'super_admin').length,
      admin: this.users.filter(u => u.role === 'admin').length,
      senior: this.users.filter(u => u.role === 'senior').length,
      junior: this.users.filter(u => u.role === 'junior').length,
      member: this.users.filter(u => u.role === 'member').length
    };
  }

  applyFilters(): void {

    let result = [...this.users];

    if (this.roleFilter !== 'all') {
      result = result.filter(u => u.role === this.roleFilter);
    }

    if (this.statusFilter !== 'all') {
      result = result.filter(u => (u.status || 'active') === this.statusFilter);
    }

    if (this.workspaceFilter !== 'all') {
      result = result.filter(u =>
        u.workspaceIds?.includes(this.workspaceFilter)
      );
    }

    if (this.searchText.trim()) {
      const q = this.searchText.toLowerCase();
      result = result.filter(u =>
        u.name.toLowerCase().includes(q)
        || u.email.toLowerCase().includes(q)
        || (u.department || '').toLowerCase().includes(q)
      );
    }

    this.filteredUsers = result;
    this.totalPages = Math.max(1, Math.ceil(result.length / this.pageSize));

    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }

    const start = (this.currentPage - 1) * this.pageSize;
    this.paginatedUsers = result.slice(start, start + this.pageSize);
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  goToPage(page: number): void {

    if (page < 1 || page > this.totalPages) return;

    this.currentPage = page;
    this.applyFilters();
  }

  getRoleLabel(user: AppUser): string {
    return this.rolePermission.getRoleLabel(user);
  }

  getRoleClass(user: AppUser): string {
    return this.rolePermission.normalizeRole(user.role);
  }

  getStatusLabel(user: AppUser): string {
    return user.status === 'inactive' ? 'Inactive' : 'Active';
  }

  getWorkspaceNames(user: AppUser): string {

    if (!user.workspaceIds?.length) return 'None';

    return user.workspaceIds
      .map(id => this.workspaceMap[id] || 'Unknown')
      .join(', ');
  }

  createUser(): void {
    this.router.navigate(['/admin/users/new']);
  }

  editUser(uid: string): void {
    this.router.navigate(['/admin/users', uid, 'edit']);
  }

  viewPermissions(): void {
    this.router.navigate(['/admin/roles']);
  }

  async toggleStatus(user: AppUser): Promise<void> {

    const nextStatus: UserStatus =
      user.status === 'inactive' ? 'active' : 'inactive';

    this.actionLoading = user.uid;

    try {
      await this.userManagement.setUserStatus(user.uid, nextStatus);
    } finally {
      this.actionLoading = null;
    }
  }

  async resetPassword(user: AppUser): Promise<void> {

    if (!confirm(`Send password reset email to ${user.email}?`)) return;

    this.actionLoading = user.uid;

    try {
      await this.userManagement.sendPasswordReset(user.email);
      alert(`Password reset email sent to ${user.email}`);
    } catch (err: any) {
      alert(err.message || 'Failed to send reset email');
    } finally {
      this.actionLoading = null;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
