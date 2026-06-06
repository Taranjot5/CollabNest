import { Component, OnInit } from '@angular/core';

import { AngularFireAuth } from '@angular/fire/compat/auth';

import { ActivatedRoute } from '@angular/router';

import { forkJoin } from 'rxjs';

import { take } from 'rxjs/operators';

import {
  WorkspaceService,
  WorkspaceActivity
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
import { Folder } from '../../../folders/models/folder.model';
import { FolderService } from '../../../folders/services/folder.service';

@Component({
  selector: 'app-workspace-details',
  templateUrl: './workspace-details.component.html',
  styleUrls: ['./workspace-details.component.scss']
})
export class WorkspaceDetailsComponent
  implements OnInit {

  selectedFolderFilter = '';

  folders: Folder[] = [];

  selectedFolderId = '';

  currentUserId = '';

  starredNotes = 0;

  recentActivities = 0;

  isOwner = false;

  isAdmin = false;

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
  // ACTIVITIES
  // =========================

  activities: WorkspaceActivity[] = [];

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
    private folderService: FolderService,

    private route: ActivatedRoute,

    private workspaceService: WorkspaceService,

    private noteService: NoteService,

    private authService: AuthService,

    private afAuth: AngularFireAuth

  ) { }

  // =========================
  // INIT
  // =========================

  ngOnInit(): void {

    this.workspaceId =
      this.route.snapshot.params['id'];

    this.afAuth.authState.subscribe(user => {

      if (!user) {
        return;
      }

      this.currentUserId = user.uid;

      this.loadWorkspace();

      this.loadWorkspaceNotes();

      this.loadActivities();
    });
  }

  getRole(memberId: string): string {

    if (!this.workspace) {
      return 'Member';
    }

    if (
      this.workspace.ownerId === memberId
    ) {
      return 'Owner';
    }

    if (
      this.workspace.admins?.includes(memberId)
    ) {
      return 'Admin';
    }

    return 'Member';
  }

  loadFolders() {

    this.folderService
      .getFolders(
        this.workspaceId
      )
      .subscribe(data => {

        this.folders = data;
      });
  }

  async createFolder() {

    const name =
      prompt('Folder Name');

    if (!name) {
      return;
    }

    await this.folderService
      .createFolder(
        name,
        this.workspaceId
      );
  }

  filterByFolder(
    folderId?: string
  ) {

    this.selectedFolderFilter =
      folderId || '';
  }

  get filteredNotes() {

    if (
      !this.selectedFolderFilter
    ) {

      return this.notes;
    }

    return this.notes.filter(

      note =>

        note.folderId ===
        this.selectedFolderFilter
    );
  }

  getFolderName(
    folderId?: string
  ) {

    return this.folders.find(

      folder =>

        folder.id === folderId

    )?.name || '';
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

          this.isOwner =
            data.ownerId === this.currentUserId;

          this.isAdmin =
            data.admins?.includes(
              this.currentUserId
            ) || this.isOwner;

          this.loadMembers();
          this.loadFolders();
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
  // LOAD NOTES
  // =========================

  loadWorkspaceNotes() {

    this.noteService
      .getNotes(this.workspaceId)
      .subscribe(notes => {

        this.notes = notes;

        this.starredNotes =
          notes.filter(
            n =>
              n.starredBy &&
              n.starredBy.length > 0
          ).length;
      });
  }

  // =========================
  // LOAD ACTIVITIES
  // =========================

  loadActivities() {

    this.workspaceService
      .getActivities(this.workspaceId)
      .subscribe(data => {

        this.activities = data;

        this.recentActivities =
          data.length;
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

          this.workspaceId,

          this.selectedFolderId
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
    id?: string,
    title?: string
  ) {

    if (!id) {
      return;
    }

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


    if (!note.id) {
      return;
    }

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

  async makeAdmin(memberId: string) {

    await this.workspaceService
      .makeAdmin(
        this.workspaceId,
        memberId
      );
  }

  async removeAdmin(memberId: string) {

    await this.workspaceService
      .removeAdmin(
        this.workspaceId,
        memberId
      );
  }
}
