import { Component, OnDestroy, OnInit } from '@angular/core';

import { Router } from '@angular/router';

import { Subject } from 'rxjs';

import { takeUntil } from 'rxjs/operators';

import { AuthService } from '../../../core/services/auth.service';

import { RolePermissionService } from '../../../core/services/role-permission.service';

import { UserManagementService } from '../../../core/services/user-management.service';

import { WorkspaceService } from '../../workspaces/services/workspace.service';

import { Workspace } from '../../workspaces/models/workspace.model';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, OnDestroy {

  isEditing = false;

  uid = '';

  loading = true;

  saving = false;

  resettingPassword = false;

  name = '';

  email = '';

  bio = '';

  department = '';

  designation = '';

  role = 'viewer';

  roleLabel = 'Viewer';

  status = 'active';

  workspaceIds: string[] = [];

  assignedWorkspaces: Workspace[] = [];

  successMessage = '';

  errorMessage = '';

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private authService: AuthService,
    private rolePermission: RolePermissionService,
    private userManagement: UserManagementService,
    private workspaceService: WorkspaceService
  ) {}

  ngOnInit(): void {

    this.authService.getCurrentUser().pipe(
      takeUntil(this.destroy$)
    ).subscribe(user => {

      if (!user) {
        this.loading = false;
        return;
      }

      this.uid = user.uid;
      this.loadProfile();
    });
  }

  editProfile(): void {
    this.isEditing = true;
    this.successMessage = '';
    this.errorMessage = '';
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.loadProfile();
  }

  loadProfile(): void {

    this.authService.getUserById(this.uid).pipe(
      takeUntil(this.destroy$)
    ).subscribe((user: any) => {

      if (!user) {
        this.loading = false;
        return;
      }

      this.name = user.name || '';
      this.email = user.email || '';
      this.bio = user.bio || '';
      this.department = user.department || '';
      this.designation = user.designation || '';
      this.status = user.status || 'active';
      this.workspaceIds = user.workspaceIds || [];
      this.role = this.rolePermission.normalizeRole(user.role);
      this.roleLabel = this.rolePermission.getRoleLabel(user);

      this.loadWorkspaces();
      this.loading = false;
    });
  }

  loadWorkspaces(): void {

    this.workspaceService.getUserWorkspaces().pipe(
      takeUntil(this.destroy$)
    ).subscribe(workspaces => {
      this.assignedWorkspaces = workspaces.filter(
        ws => this.workspaceIds.includes(ws.id!) || !this.workspaceIds.length
      );
    });
  }

  async saveProfile(): Promise<void> {

    this.successMessage = '';
    this.errorMessage = '';

    try {
      this.saving = true;

      await this.authService.updateProfile(this.uid, {
        name: this.name,
        bio: this.bio,
        department: this.department,
        designation: this.designation
      });

      this.isEditing = false;
      this.successMessage = 'Profile updated successfully';

    } catch {
      this.errorMessage = 'Failed to update profile';
    } finally {
      this.saving = false;
    }
  }

  async resetPassword(): Promise<void> {

    if (!confirm(`Send password reset email to ${this.email}?`)) return;

    this.resettingPassword = true;
    this.errorMessage = '';

    try {
      await this.userManagement.sendPasswordReset(this.email);
      this.successMessage = 'Password reset email sent';
    } catch (err: any) {
      this.errorMessage = err.message || 'Failed to send reset email';
    } finally {
      this.resettingPassword = false;
    }
  }

  getStatusLabel(): string {
    return this.status === 'inactive' ? 'Inactive' : 'Active';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
