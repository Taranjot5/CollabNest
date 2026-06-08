import { Component, OnDestroy, OnInit } from '@angular/core';

import { Router, NavigationEnd } from '@angular/router';

import { filter, takeUntil } from 'rxjs/operators';

import { Subject } from 'rxjs';

import { AngularFireAuth } from '@angular/fire/compat/auth';

import { AuthService } from '../../services/auth.service';

import { RolePermissionService } from '../../services/role-permission.service';

import { AppUser } from '../../../models/user.model';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent implements OnInit, OnDestroy {

  searchQuery = '';

  pageTitle = 'Knowledge Hub';

  userProfile: AppUser | null = null;

  canAccessDashboard = true;

  canAccessNotes = true;

  canAccessWorkspaces = true;

  canAccessTasks = true;

  canAccessNotifications = true;

  canAccessTrash = true;

  isSuperAdmin = false;

  private destroy$ = new Subject<void>();

  private titleMap: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/dashboard/recent': 'Recent Notes',
    '/dashboard/shared': 'Shared Notes',
    '/dashboard/starred': 'Starred Notes',
    '/notes': 'Notes',
    '/notes/trash': 'Trash',
    '/notifications': 'Notifications',
    '/workspaces': 'Workspaces',
    '/tasks': 'Tasks',
    '/tasks/new': 'Create Task',
    '/profile': 'Profile',
    '/admin/users': 'User Management',
    '/admin/roles': 'Role Permissions'
  };

  constructor(
    private authService: AuthService,
    private rolePermission: RolePermissionService,
    private afAuth: AngularFireAuth,
    private router: Router
  ) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.updatePageTitle(event.urlAfterRedirects);
    });
  }

  ngOnInit(): void {

    this.afAuth.authState.pipe(
      takeUntil(this.destroy$)
    ).subscribe(user => {

      if (!user) {
        this.userProfile = null;
        return;
      }

      this.authService.getUserById(user.uid).pipe(
        takeUntil(this.destroy$)
      ).subscribe(profile => {
        this.userProfile = profile;
        this.updateNavPermissions(profile);
      });
    });
  }

  updateNavPermissions(profile: AppUser): void {

    this.canAccessDashboard = this.rolePermission.hasPermission(profile, 'dashboard');
    this.canAccessNotes = this.rolePermission.hasPermission(profile, 'notes');
    this.canAccessWorkspaces = this.rolePermission.hasPermission(profile, 'workspaces');
    this.canAccessTasks = this.rolePermission.hasPermission(profile, 'tasks');
    this.canAccessNotifications = this.rolePermission.hasPermission(profile, 'notifications');
    this.canAccessTrash = this.rolePermission.hasPermission(profile, 'trash');
    this.isSuperAdmin = this.rolePermission.isSuperAdmin(profile);
  }

  updatePageTitle(url: string): void {

    const path = url.split('?')[0];

    if (this.titleMap[path]) {
      this.pageTitle = this.titleMap[path];
      return;
    }

    if (path.startsWith('/notes/')) {
      this.pageTitle = 'Note Details';
      return;
    }

    if (path.startsWith('/workspaces/')) {
      this.pageTitle = 'Workspace';
      return;
    }

    if (path.startsWith('/tasks/') && path.endsWith('/edit')) {
      this.pageTitle = 'Edit Task';
      return;
    }

    if (path.startsWith('/tasks/')) {
      this.pageTitle = 'Task Details';
      return;
    }

    if (path.startsWith('/admin/users/') && path.endsWith('/edit')) {
      this.pageTitle = 'Edit User';
      return;
    }

    if (path.startsWith('/admin/users/new')) {
      this.pageTitle = 'Add User';
      return;
    }

    this.pageTitle = 'Knowledge Hub';
  }

  onSearch(): void {

    if (!this.searchQuery.trim()) return;

    this.router.navigate(['/notes'], {
      queryParams: { q: this.searchQuery.trim() }
    });
  }

  async logout(): Promise<void> {

    await this.authService.logout();

    this.router.navigate(['/auth/login']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
