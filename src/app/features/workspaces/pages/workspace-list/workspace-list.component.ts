import { Component, OnInit } from '@angular/core';

import { Router } from '@angular/router';

import { AngularFireAuth } from '@angular/fire/compat/auth';

import { take } from 'rxjs/operators';

import { WorkspaceService } from '../../services/workspace.service';

import { Workspace } from '../../models/workspace.model';

@Component({
  selector: 'app-workspace-list',
  templateUrl: './workspace-list.component.html',
  styleUrls: ['./workspace-list.component.scss']
})
export class WorkspaceListComponent implements OnInit {

  workspaces: Workspace[] = [];

  workspaceName = '';

  workspaceDescription = '';

  searchText = '';

  showCreateForm = false;

  loading = false;

  currentUserId = '';

  private avatarColors = [
    'linear-gradient(135deg, #7c3aed, #a78bfa)',
    'linear-gradient(135deg, #2563eb, #60a5fa)',
    'linear-gradient(135deg, #059669, #34d399)',
    'linear-gradient(135deg, #d97706, #fbbf24)',
    'linear-gradient(135deg, #dc2626, #f87171)'
  ];

  constructor(
    private workspaceService: WorkspaceService,
    private afAuth: AngularFireAuth,
    private router: Router
  ) {}

  get filteredWorkspaces(): Workspace[] {

    if (!this.searchText.trim()) return this.workspaces;

    const q = this.searchText.toLowerCase();

    return this.workspaces.filter(ws =>
      ws.name.toLowerCase().includes(q)
      || (ws.description || '').toLowerCase().includes(q)
    );
  }

  ngOnInit(): void {

    this.afAuth.authState.pipe(take(1)).subscribe(user => {
      this.currentUserId = user?.uid || '';
    });

    this.loadWorkspaces();
  }

  loadWorkspaces(): void {

    this.workspaceService.getUserWorkspaces().subscribe(data => {
      this.workspaces = data;
    });
  }

  async createWorkspace(): Promise<void> {

    if (!this.workspaceName.trim()) return;

    this.loading = true;

    await this.workspaceService.createWorkspace(
      this.workspaceName.trim(),
      this.workspaceDescription.trim()
    );

    this.workspaceName = '';
    this.workspaceDescription = '';
    this.showCreateForm = false;
    this.loading = false;
  }

  openWorkspace(id?: string): void {

    if (!id) return;

    this.router.navigate(['/workspaces', id]);
  }

  isOwner(workspace: Workspace): boolean {
    return workspace.ownerId === this.currentUserId;
  }

  isAdmin(workspace: Workspace): boolean {
    return workspace.admins?.includes(this.currentUserId) || false;
  }

  getAvatarColor(name: string): string {
    const index = name.charCodeAt(0) % this.avatarColors.length;
    return this.avatarColors[index];
  }
}
