import { Component, OnDestroy, OnInit } from '@angular/core';

import { Router, NavigationEnd } from '@angular/router';

import { filter, take, takeUntil } from 'rxjs/operators';

import { Subject } from 'rxjs';

import { AngularFireAuth } from '@angular/fire/compat/auth';

import { AuthService } from '../../services/auth.service';

import { RolePermissionService } from '../../services/role-permission.service';

import { NotificationService } from '../../services/notification.service';

import { WorkspaceService } from '../../../features/workspaces/services/workspace.service';

import { WorkspaceContextService } from '../../services/workspace-context.service';

import { ThemeService } from '../../services/theme.service';

import { AppUser } from '../../../models/user.model';

import { Workspace } from '../../../features/workspaces/models/workspace.model';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent implements OnInit, OnDestroy {

  searchQuery = '';

  pageTitle = 'Collab Nest';

  userProfile: AppUser | null = null;

  workspaces: Workspace[] = [];

  activeWorkspace: Workspace | null = null;

  unreadCount = 0;

  isDarkTheme = false;

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
    '/search': 'Search',
    '/admin/users': 'User Management',
    '/admin/roles': 'Role Permissions',
    '/admin/audit-logs': 'Audit Logs'
  };

  constructor(
    private authService: AuthService,
    private rolePermission: RolePermissionService,
    private notificationService: NotificationService,
    private workspaceService: WorkspaceService,
    private workspaceContext: WorkspaceContextService,
    private themeService: ThemeService,
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

    this.themeService.theme$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(theme => {
      this.isDarkTheme = theme === 'dark';
    });

    this.workspaceContext.activeWorkspace$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(ws => {
      this.activeWorkspace = ws;
    });

    this.notificationService.getUnreadCount().pipe(
      takeUntil(this.destroy$)
    ).subscribe(count => {
      this.unreadCount = count;
    });

    this.afAuth.authState.pipe(
      takeUntil(this.destroy$)
    ).subscribe(user => {

      if (!user) {
        this.userProfile = null;
        this.workspaces = [];
        return;
      }

      this.authService.getUserById(user.uid).pipe(
        takeUntil(this.destroy$)
      ).subscribe(profile => {
        this.userProfile = profile;
        this.updateNavPermissions(profile);
      });

      this.workspaceService.getUserWorkspaces().pipe(
        takeUntil(this.destroy$)
      ).subscribe(workspaces => {
        this.workspaces = workspaces;
        this.restoreActiveWorkspace(workspaces);
      });
    });
  }

  restoreActiveWorkspace(workspaces: Workspace[]): void {

    const storedId = this.workspaceContext.getStoredWorkspaceId();

    if (!storedId) return;

    const match = workspaces.find(w => w.id === storedId);

    if (match) {
      this.workspaceContext.setActiveWorkspace(match);
    }
  }

  switchWorkspace(workspace: Workspace | null): void {
    this.workspaceContext.setActiveWorkspace(workspace);
  }

  switchWorkspaceById(workspaceId: string): void {

    if (!workspaceId) {
      this.switchWorkspace(null);
      return;
    }

    const match = this.workspaces.find(w => w.id === workspaceId) || null;
    this.switchWorkspace(match);
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

    this.pageTitle = 'Collab Nest';
  }

  onSearch(): void {

    this.router.navigate(['/search'], {
      queryParams: { q: this.searchQuery.trim() || undefined }
    });
  }

  toggleTheme(): void {
    this.themeService.toggle();
  }

  async logout(): Promise<void> {

    await this.authService.logout();
    this.workspaceContext.clear();
    this.router.navigate(['/auth/login']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
