import { Injectable } from '@angular/core';

import { BehaviorSubject, Observable } from 'rxjs';

import { Workspace } from '../../features/workspaces/models/workspace.model';

const STORAGE_KEY = 'kh_active_workspace_id';

@Injectable({
  providedIn: 'root'
})
export class WorkspaceContextService {

  private activeWorkspaceSubject =
    new BehaviorSubject<Workspace | null>(null);

  activeWorkspace$ = this.activeWorkspaceSubject.asObservable();

  get activeWorkspace(): Workspace | null {
    return this.activeWorkspaceSubject.value;
  }

  get activeWorkspaceId(): string | null {
    return this.activeWorkspace?.id || null;
  }

  setActiveWorkspace(workspace: Workspace | null): void {

    this.activeWorkspaceSubject.next(workspace);

    if (workspace?.id) {
      localStorage.setItem(STORAGE_KEY, workspace.id);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  getStoredWorkspaceId(): string | null {
    return localStorage.getItem(STORAGE_KEY);
  }

  clear(): void {
    this.setActiveWorkspace(null);
  }
}
