import { Component, OnInit } from '@angular/core';

import { AngularFireAuth } from '@angular/fire/compat/auth';

import { ActivatedRoute, Router } from '@angular/router';

import { forkJoin } from 'rxjs';

import { take } from 'rxjs/operators';

import { CommentService }
  from '../../../notes/services/comment.service';

import {
  NotificationService
}
  from '../../../../core/services/notification.service';

import { Comment }
  from '../../../notes/models/comment.model';

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

import {
  NoteVersionService
}
  from '../../../notes/services/note-version.service';

@Component({
  selector: 'app-workspace-details',
  templateUrl: './workspace-details.component.html',
  styleUrls: ['./workspace-details.component.scss']
})
export class WorkspaceDetailsComponent
  implements OnInit {

  showCreateNoteModal = false;

  showFolderModal = false;

  folderModalName = '';

  editingFolder: Folder | null = null;

  selectedVersions: any[] = [];

  selectedVersionNote: Note | null = null;

  selectedFiles: File[] = [];

  comments: {
    [noteId: string]: Comment[];
  } = {};

  commentInputs: {
    [noteId: string]: string;
  } = {};

  searchTerm = '';

  selectedCategoryFilter = '';

  selectedTagFilter = '';

  showStarredOnly = false;

  folders: Folder[] = [];

  selectedFolderId = '';

  currentUserId = '';

  starredNotes = 0;

  recentActivities = 0;

  isOwner = false;

  isAdmin = false;

  workspace?: Workspace;

  workspaceId = '';

  members: any[] = [];

  notes: Note[] = [];

  activities: WorkspaceActivity[] = [];

  inviteEmail = '';

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

  private avatarColors = [
    'linear-gradient(135deg, #7c3aed, #a78bfa)',
    'linear-gradient(135deg, #2563eb, #60a5fa)',
    'linear-gradient(135deg, #059669, #34d399)',
    'linear-gradient(135deg, #d97706, #fbbf24)',
    'linear-gradient(135deg, #dc2626, #f87171)'
  ];

  constructor(
    private noteVersionService: NoteVersionService,

    private notificationService: NotificationService,

    private commentService: CommentService,

    private folderService: FolderService,

    private route: ActivatedRoute,

    private workspaceService: WorkspaceService,

    private noteService: NoteService,

    private authService: AuthService,

    private afAuth: AngularFireAuth,

    private router: Router

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

  openCreateFolderModal(): void {
    this.editingFolder = null;
    this.folderModalName = '';
    this.showFolderModal = true;
  }

  openRenameFolderModal(folder: Folder, event?: Event): void {
    event?.stopPropagation();
    this.editingFolder = folder;
    this.folderModalName = folder.name;
    this.showFolderModal = true;
  }

  closeFolderModal(): void {
    this.showFolderModal = false;
    this.editingFolder = null;
    this.folderModalName = '';
  }

  async saveFolderModal(): Promise<void> {

    const name = this.folderModalName.trim();

    if (!name) {
      return;
    }

    if (this.editingFolder) {
      if (name !== this.editingFolder.name) {
        await this.folderService.updateFolder(this.editingFolder.id!, name);
      }
    } else {
      await this.folderService.createFolder(name, this.workspaceId);
    }

    this.closeFolderModal();
  }

  async deleteFolder(
    folder: Folder
  ) {

    const confirmed =
      confirm(
        `Delete "${folder.name}"?`
      );

    if (!confirmed) {
      return;
    }

    await this.folderService
      .deleteFolder(
        folder.id!
      );
  }

  selectFolder(folderId: string): void {
    this.selectedFolderId = folderId;
  }

  get filteredNotes(): Note[] {

    let filtered = [...this.notes];

    if (this.selectedFolderId) {
      filtered = filtered.filter(
        note => note.folderId === this.selectedFolderId
      );
    }

    // Search

    if (this.searchTerm.trim()) {


      const term =
        this.searchTerm
          .toLowerCase();

      filtered = filtered.filter(

        note =>

          note.title
            .toLowerCase()
            .includes(term)

          ||

          note.content
            .toLowerCase()
            .includes(term)
      );


    }

    // Category

    if (
      this.selectedCategoryFilter
    ) {


      filtered = filtered.filter(

        note =>

          note.category ===
          this.selectedCategoryFilter
      );


    }

    // Tags

    if (
      this.selectedTagFilter
    ) {


      filtered = filtered.filter(

        note =>

          note.tags?.includes(
            this.selectedTagFilter
          )
      );


    }

    // Starred

    if (
      this.showStarredOnly
    ) {


      filtered = filtered.filter(

        note =>

          note.starredBy?.length
      );


    }

    return filtered.sort((a, b) => {

      if (a.isPinned && !b.isPinned) {
        return -1;
      }

      if (!a.isPinned && b.isPinned) {
        return 1;
      }

      return (
        new Date(b.updatedAt || '').getTime() -
        new Date(a.updatedAt || '').getTime()
      );

    });
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

        notes.forEach(note => {

          if (!note.id) {
            return;
          }

          this.loadComments(
            note.id
          );
        });

        this.starredNotes =
          notes.filter(
            n =>
              n.starredBy &&
              n.starredBy.length > 0
          ).length;
      });
  }

  loadComments(
    noteId: string
  ) {

    this.commentService

      .getComments(noteId)

      .subscribe(data => {

        this.comments[noteId] =
          data;
      });
  }

  async addComment(
    note: Note
  ) {

    if (!note.id) {
      return;
    }

    const message =

      this.commentInputs[
        note.id
      ]?.trim();

    if (!message) {
      return;
    }

    const user =

      this.members.find(

        m =>

          m.id ===
          this.currentUserId
      );

    await this.commentService
      .addComment(


        note.id,

        this.workspaceId,

        message,

        user?.name ||
        'Unknown User'


      );

    /* ======================
    COMMENT NOTIFICATIONS
    ====================== */

    const receivers =
      new Set<string>();

    if (
      note.createdBy &&
      note.createdBy !==
      this.currentUserId
    ) {

      receivers.add(
        note.createdBy
      );
    }

    note.participants
      ?.forEach(id => {


        if (
          id !==
          this.currentUserId
        ) {

          receivers.add(id);
        }


      });

    note.collaborators
      ?.forEach(id => {


        if (
          id !==
          this.currentUserId
        ) {

          receivers.add(id);
        }


      });

    for (
      const receiverId
      of receivers
    ) {

      await this
        .notificationService
        .createNotification(


          'New Comment',

          `${user?.name} commented on "${note.title}"`,

          'comment',

          receiverId
        );


    }


    this.commentInputs[
      note.id
    ] = '';
  }

  async deleteComment(
    commentId?: string
  ) {

    if (!commentId) {
      return;
    }

    await this.commentService
      .deleteComment(
        commentId
      );
  }

  // =========================
  // LOAD ACTIVITIES
  // =========================

  loadActivities() {

    this.workspaceService
      .getActivities(this.workspaceId)
      .subscribe({
        next: data => {
          this.activities = data;
          this.recentActivities = data.length;
        },
        error: () => {
          this.activities = [];
        }
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

    const noteTitle = this.title.trim();

    try {

      await this.noteService.createNote(
        noteTitle,
        this.content,
        this.category,
        this.priority,
        this.workspaceId,
        this.selectedFolderId
      );

      await this.workspaceService.addActivity(
        this.workspaceId,
        'note_created',
        `Note "${noteTitle}" was created`
      );

      this.title = '';
      this.content = '';
      this.category = 'Work';
      this.priority = 'Medium';
      this.selectedFolderId = '';
      this.showCreateNoteModal = false;

    } catch (error) {

      console.error('Create note failed', error);
    }

  }

  openNote(note: Note): void {

    if (!note.id) {
      return;
    }

    this.router.navigate(['/notes', note.id]);
  }

  editNote(note: Note): void {

    if (!note.id) {
      return;
    }

    this.router.navigate(['/notes', note.id, 'edit']);
  }

  scrollToInvite(): void {

    const el = document.getElementById('invite-section');

    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      const input = el.querySelector('input[type="email"]') as HTMLInputElement;
      input?.focus();
    }
  }

  closeCreateNoteModal(): void {
    this.showCreateNoteModal = false;
  }

  showVersions(
    note: Note
  ) {

    if (!note.id) {
      return;
    }

    this.selectedVersionNote =
      note;

    this.noteVersionService


      .getVersions(
        note.id
      )

      .subscribe(data => {

        this.selectedVersions =
          data;
      });


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

      await this.noteService.deleteNote(id);

      await this.workspaceService.addActivity(
        this.workspaceId,
        'note_deleted',
        `Note "${title || 'Untitled'}" was deleted`
      );

    } catch (error) {

      console.error('Delete note failed', error);
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

      this.router.navigate(['/workspaces']);

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

  getFolderNoteCount(folderId: string): number {
    return this.notes.filter(note => note.folderId === folderId).length;
  }

  getMemberCount(): number {
    return this.workspace?.members?.length ?? 0;
  }

  getAvatarColor(name: string): string {
    const index = (name?.charCodeAt(0) || 0) % this.avatarColors.length;
    return this.avatarColors[index];
  }

  stripHtml(html: string): string {
    if (!html) return '';
    const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    return text.length > 140 ? text.slice(0, 140) + '…' : text;
  }

  togglePin(note: Note) {

    this.noteService
      .togglePin(
        note.id!,
        note.isPinned || false
      );

  }


  trackByNote(
    index: number,
    note: Note
  ): string {

    return note.id || index.toString();
  }

  trackByFolder(
    index: number,
    folder: Folder
  ): string {

    return folder.id || index.toString();
  }

  trackByMember(
    index: number,
    member: any
  ): string {

    return member.id || index.toString();
  }

  trackByActivity(
    index: number,
    activity: WorkspaceActivity
  ): string {

    return activity.id || index.toString();
  }

  trackByComment(
    index: number,
    comment: Comment
  ): string {

    return comment.id || index.toString();
  }
}