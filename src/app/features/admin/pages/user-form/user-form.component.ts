import { Component, OnDestroy, OnInit } from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';

import { Subject } from 'rxjs';

import { take, takeUntil } from 'rxjs/operators';

import { UserManagementService } from '../../../../core/services/user-management.service';

import { WorkspaceService } from '../../../workspaces/services/workspace.service';

import {
  ASSIGNABLE_ROLES,
  DISPLAY_ROLE_LABELS,
  StoredUserRole,
  UserStatus
} from '../../../../models/user.model';

import { Workspace } from '../../../workspaces/models/workspace.model';

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss']
})
export class UserFormComponent implements OnInit, OnDestroy {

  isEdit = false;

  userId = '';

  name = '';

  email = '';

  password = '';

  role: StoredUserRole = 'member';

  department = '';

  designation = '';

  status: UserStatus = 'active';

  selectedWorkspaces: string[] = [];

  previousWorkspaceIds: string[] = [];

  workspaces: Workspace[] = [];

  loading = false;

  saving = false;

  errorMessage = '';

  roleOptions = (['super_admin', ...ASSIGNABLE_ROLES] as StoredUserRole[]).map(role => ({
    value: role,
    label: DISPLAY_ROLE_LABELS[role]
  }));

  private destroy$ = new Subject<void>();

  constructor(
    private userManagement: UserManagementService,
    private workspaceService: WorkspaceService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {

    this.userId = this.route.snapshot.paramMap.get('id') || '';
    this.isEdit = !!this.userId;

    this.workspaceService.getAllWorkspaces().pipe(
      takeUntil(this.destroy$)
    ).subscribe(workspaces => {
      this.workspaces = workspaces;
    });

    if (this.isEdit) {
      this.loadUser();
    }
  }

  loadUser(): void {

    this.loading = true;

    this.userManagement.getUserById(this.userId).pipe(
      take(1)
    ).subscribe(user => {

      if (!user) {
        this.router.navigate(['/admin/users']);
        return;
      }

      this.name = user.name;
      this.email = user.email;
      this.role = (user.role as StoredUserRole) || 'member';
      this.department = user.department || '';
      this.designation = user.designation || '';
      this.status = user.status || 'active';
      this.selectedWorkspaces = [...(user.workspaceIds || [])];
      this.previousWorkspaceIds = [...(user.workspaceIds || [])];
      this.loading = false;
    });
  }

  toggleWorkspace(workspaceId: string): void {

    const idx = this.selectedWorkspaces.indexOf(workspaceId);

    if (idx >= 0) {
      this.selectedWorkspaces.splice(idx, 1);
    } else {
      this.selectedWorkspaces.push(workspaceId);
    }
  }

  isWorkspaceSelected(workspaceId: string): boolean {
    return this.selectedWorkspaces.includes(workspaceId);
  }

  async save(): Promise<void> {

    if (!this.name.trim() || !this.email.trim()) {
      this.errorMessage = 'Name and email are required';
      return;
    }

    if (!this.isEdit && !this.password.trim()) {
      this.errorMessage = 'Password is required for new users';
      return;
    }

    this.saving = true;
    this.errorMessage = '';

    try {

      if (this.isEdit) {
        await this.userManagement.updateUser(
          this.userId,
          {
            name: this.name.trim(),
            email: this.email.trim(),
            role: this.role,
            department: this.department.trim(),
            designation: this.designation.trim(),
            workspaceIds: this.selectedWorkspaces,
            status: this.status
          },
          this.previousWorkspaceIds
        );
      } else {
        await this.userManagement.createUser({
          name: this.name.trim(),
          email: this.email.trim(),
          password: this.password,
          role: this.role,
          department: this.department.trim(),
          designation: this.designation.trim(),
          workspaceIds: this.selectedWorkspaces
        });
      }

      this.router.navigate(['/admin/users']);

    } catch (err: any) {
      this.errorMessage = err.message || 'Failed to save user';
    } finally {
      this.saving = false;
    }
  }

  cancel(): void {
    this.router.navigate(['/admin/users']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
