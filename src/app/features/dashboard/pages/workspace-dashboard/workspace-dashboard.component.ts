import { Component, OnDestroy, OnInit } from '@angular/core';

import { Router } from '@angular/router';

import { AngularFireAuth } from '@angular/fire/compat/auth';

import { forkJoin, of, Subject } from 'rxjs';

import { switchMap, take, takeUntil } from 'rxjs/operators';

import { NoteService } from '../../../../core/services/note.service';

import { NotificationService } from '../../../../core/services/notification.service';

import { AuthService } from '../../../../core/services/auth.service';

import { WorkspaceService } from '../../../workspaces/services/workspace.service';

import { WorkspaceContextService } from '../../../../core/services/workspace-context.service';

import { FolderService } from '../../../folders/services/folder.service';

import { TaskService } from '../../../tasks/services/task.service';

import { Note } from '../../../notes/models/note.model';

import { Workspace } from '../../../workspaces/models/workspace.model';

import { AppUser } from '../../../../models/user.model';

@Component({
  selector: 'app-workspace-dashboard',
  templateUrl: './workspace-dashboard.component.html',
  styleUrl: './workspace-dashboard.component.scss'
})
export class WorkspaceDashboardComponent implements OnInit, OnDestroy {

  userName = 'there';

  stats = {
    totalNotes: 0,
    starredNotes: 0,
    workspaces: 0,
    folders: 0,
    unreadNotifications: 0,
    sharedNotes: 0,
    trashNotes: 0,
    tasks: 0
  };

  activeWorkspaceName = '';

  recentNotes: Note[] = [];

  workspaces: Workspace[] = [];

  loading = true;

  private destroy$ = new Subject<void>();

  private userProfile: AppUser | null = null;

  constructor(
    private noteService: NoteService,
    private notificationService: NotificationService,
    private workspaceService: WorkspaceService,
    private workspaceContext: WorkspaceContextService,
    private folderService: FolderService,
    private taskService: TaskService,
    private authService: AuthService,
    private afAuth: AngularFireAuth,
    private router: Router
  ) {}

  ngOnInit(): void {

    this.afAuth.authState.pipe(
      takeUntil(this.destroy$),
      switchMap(user => {

        if (!user) {
          this.loading = false;
          return of(null);
        }

        return this.authService.getUserById(user.uid).pipe(
          take(1),
          switchMap(profile => {
            this.userProfile = profile;
            if (profile?.name) {
              this.userName = profile.name.split(' ')[0];
            }
            return of(user);
          })
        );
      })
    ).subscribe(user => {

      if (!user) {
        return;
      }

      this.workspaceContext.activeWorkspace$.pipe(
        takeUntil(this.destroy$)
      ).subscribe(() => {
        this.loadDashboardData(user.uid);
      });
    });
  }

  loadDashboardData(userId: string): void {

    this.loading = true;

    const activeWs = this.workspaceContext.activeWorkspace;
    this.activeWorkspaceName = activeWs?.name || '';

    const folderObs = activeWs?.id
      ? this.folderService.getFolders(activeWs.id).pipe(take(1))
      : of([]);

    const tasksObs = this.userProfile
      ? this.taskService.getTasks(this.userProfile).pipe(take(1))
      : of([]);

    forkJoin({
      notes: this.noteService.getNotes(activeWs?.id).pipe(take(1)),
      starred: this.noteService.getStarredNotes().pipe(take(1)),
      trash: this.noteService.getTrashNotes().pipe(take(1)),
      workspaces: this.workspaceService.getUserWorkspaces().pipe(take(1)),
      notifications: this.notificationService.getNotifications().pipe(take(1)),
      folders: folderObs,
      tasks: tasksObs
    }).subscribe(({ notes, starred, trash, workspaces, notifications, folders, tasks }) => {

      const sharedNotes = notes.filter(
        note => note.createdBy !== userId
      );

      this.stats = {
        totalNotes: notes.length,
        starredNotes: starred.length,
        workspaces: workspaces.length,
        folders: folders.length,
        unreadNotifications: notifications.filter(n => !n.read).length,
        sharedNotes: sharedNotes.length,
        trashNotes: trash.length,
        tasks: tasks.length
      };

      this.recentNotes = [...notes]
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .slice(0, 5);

      this.workspaces = workspaces.slice(0, 4);
      this.loading = false;
    });
  }

  openNote(id?: string): void {

    if (!id) return;

    this.router.navigate(['/notes', id]);
  }

  openWorkspace(id?: string): void {

    if (!id) return;

    this.router.navigate(['/workspaces', id]);
  }

  getGreeting(): string {

    const hour = new Date().getHours();

    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
