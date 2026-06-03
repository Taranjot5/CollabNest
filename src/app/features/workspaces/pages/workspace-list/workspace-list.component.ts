import { Component, OnInit } from '@angular/core';

import { Router } from '@angular/router';

import {
  WorkspaceService
} from '../../services/workspace.service';

import {
  Workspace
} from '../../models/workspace.model';

@Component({
  selector: 'app-workspace-list',
  templateUrl: './workspace-list.component.html',
  styleUrls: ['./workspace-list.component.scss']
})

export class WorkspaceListComponent
implements OnInit {

  workspaces: Workspace[] = [];

  workspaceName = '';

  workspaceDescription = '';

  loading = false;

  constructor(
    private workspaceService:
    WorkspaceService,

    private router: Router
  ) {}

  ngOnInit(): void {

    this.loadWorkspaces();
  }

  // =========================
  // LOAD WORKSPACES
  // =========================

  loadWorkspaces() {

    this.workspaceService
      .getUserWorkspaces()
      .subscribe(data => {

        this.workspaces = data;
      });
  }

  // =========================
  // CREATE WORKSPACE
  // =========================

  async createWorkspace() {

    if (!this.workspaceName) return;

    this.loading = true;

    await this.workspaceService
      .createWorkspace(

        this.workspaceName,

        this.workspaceDescription
      );

    this.workspaceName = '';

    this.workspaceDescription = '';

    this.loading = false;
  }

  // =========================
  // OPEN WORKSPACE
  // =========================

  openWorkspace(id?: string) {

    if (!id) return;

    this.router.navigate([
      '/workspaces',
      id
    ]);
  }
}