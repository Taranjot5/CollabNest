import { Component, OnInit } from '@angular/core';

import { ActivatedRoute } from '@angular/router';

import { forkJoin } from 'rxjs';

import { take } from 'rxjs/operators';

import {
  WorkspaceService
} from '../../services/workspace.service';

import {
  Workspace
} from '../../models/workspace.model';

import {
  NoteService
} from '../../../../core/services/note.service';

import {
  Note
} from '../../../notes/models/note.model';

import {
  AuthService
} from '../../../../core/services/auth.service';

@Component({
  selector: 'app-workspace-details',
  templateUrl: './workspace-details.component.html',
  styleUrls: ['./workspace-details.component.scss']
})

export class WorkspaceDetailsComponent
implements OnInit {

  // =========================
  // WORKSPACE
  // =========================

  workspace?: Workspace;

  workspaceId = '';

  // =========================
  // MEMBERS
  // =========================

  members: any[] = [];

  // =========================
  // NOTES
  // =========================

  notes: Note[] = [];

  // =========================
  // INVITE MEMBER
  // =========================

  inviteEmail = '';

  // =========================
  // CREATE NOTE
  // =========================

  title = '';

  content = '';

  category = 'Work';

  priority = 'Medium';

  categories = [
    'Work',
    'Study',
    'Personal',
    'Ideas'
  ];

  constructor(

    private route: ActivatedRoute,

    private workspaceService:
    WorkspaceService,

    private noteService:
    NoteService,

    private authService:
    AuthService

  ) {}

  // =========================
  // INIT
  // =========================

  ngOnInit(): void {

    this.workspaceId =
      this.route.snapshot.params['id'];

    this.loadWorkspace();

    this.loadWorkspaceNotes();
  }

  // =========================
  // LOAD WORKSPACE
  // =========================

  loadWorkspace() {

    this.workspaceService
      .getWorkspaceById(
        this.workspaceId
      )
      .subscribe(data => {

        if (data) {

          this.workspace = data;

          this.loadMembers();
        }
      });
  }

  // =========================
  // LOAD MEMBER DETAILS
  // =========================

  loadMembers() {

    if (
      !this.workspace ||
      !this.workspace.members?.length
    ) {
      return;
    }

    const requests =

      this.workspace.members.map(uid =>

        this.authService
          .getUserById(uid)
          .pipe(take(1))
      );

    forkJoin(requests)
      .subscribe(users => {

        this.members = users;
      });
  }

  // =========================
  // LOAD WORKSPACE NOTES
  // =========================

  loadWorkspaceNotes() {

    this.noteService
      .getNotes(this.workspaceId)
      .subscribe(notes => {

        this.notes = notes;
      });
  }

  // =========================
  // CREATE NOTE
  // =========================

  async createNote() {

    if (
      !this.title.trim() ||
      !this.content.trim()
    ) {
      return;
    }

    try {

      await this.noteService
        .createNote(

          this.title,

          this.content,

          this.category,

          this.priority,

          this.workspaceId
        );

      this.title = '';

      this.content = '';

      this.category = 'Work';

      this.priority = 'Medium';

    } catch (error) {

      console.error(
        'Create note failed',
        error
      );
    }
  }

  // =========================
  // DELETE NOTE
  // =========================

  async deleteNote(
    id?: string
  ) {

    if (!id) return;

    try {

      await this.noteService
        .deleteNote(id);

    } catch (error) {

      console.error(
        'Delete note failed',
        error
      );
    }
  }

  // =========================
  // TOGGLE STAR
  // =========================

  async toggleStar(
    note: Note
  ) {

    if (!note.id) return;

    try {

      await this.noteService
        .toggleStar(

          note.id,

          note.starredBy || []
        );

    } catch (error) {

      console.error(
        'Toggle star failed',
        error
      );
    }
  }

  // =========================
  // INVITE MEMBER
  // =========================

  async inviteMember() {

    if (
      !this.inviteEmail.trim()
    ) {
      return;
    }

    try {

      await this.workspaceService
        .inviteMember(

          this.workspaceId,

          this.inviteEmail
        );

      this.inviteEmail = '';

    } catch (error) {

      console.error(
        'Invite member failed',
        error
      );
    }
  }

  // =========================
  // REMOVE MEMBER
  // =========================

  async removeMember(
    memberId: string
  ) {

    try {

      await this.workspaceService
        .removeMember(

          this.workspaceId,

          memberId
        );

    } catch (error) {

      console.error(
        'Remove member failed',
        error
      );
    }
  }

  // =========================
  // DELETE WORKSPACE
  // =========================

  async deleteWorkspace() {

    if (!this.workspaceId) {
      return;
    }

    const confirmed =
      confirm(
        'Delete this workspace?'
      );

    if (!confirmed) {
      return;
    }

    try {

      await this.workspaceService
        .deleteWorkspace(
          this.workspaceId
        );

    } catch (error) {

      console.error(
        'Delete workspace failed',
        error
      );
    }
  }
}