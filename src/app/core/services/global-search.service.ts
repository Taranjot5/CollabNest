import { Injectable } from '@angular/core';

import { Observable, combineLatest, of } from 'rxjs';

import { map, debounceTime, switchMap, take } from 'rxjs/operators';

import { NoteService } from './note.service';

import { WorkspaceService } from '../../features/workspaces/services/workspace.service';

import { TaskService } from '../../features/tasks/services/task.service';

import { AuthService } from './auth.service';

import { AngularFireAuth } from '@angular/fire/compat/auth';

import { Note } from '../../features/notes/models/note.model';

import { Workspace } from '../../features/workspaces/models/workspace.model';

import { Task } from '../../features/tasks/models/task.model';

import { AppUser } from '../../models/user.model';

export type SearchResultType = 'note' | 'workspace' | 'task';

export interface SearchResult {

  type: SearchResultType;

  id: string;

  title: string;

  subtitle: string;

  score: number;

  route: string[];

  meta?: Record<string, string>;
}

export interface SearchFilters {

  types: SearchResultType[];

  tags: string[];

  priority: string;

  category: string;

  dateFrom: number | null;

  dateTo: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class GlobalSearchService {

  constructor(
    private noteService: NoteService,
    private workspaceService: WorkspaceService,
    private taskService: TaskService,
    private authService: AuthService,
    private afAuth: AngularFireAuth
  ) {}

  search(
    query: string,
    filters: Partial<SearchFilters> = {}
  ): Observable<SearchResult[]> {

    const q = query.trim().toLowerCase();

    if (!q) {
      return of([]);
    }

    return this.afAuth.authState.pipe(
      take(1),
      switchMap(user => {

        if (!user) return of([]);

        return this.authService.getUserById(user.uid).pipe(
          take(1),
          switchMap(profile => {

            if (!profile) return of([]);

            return combineLatest([
              this.noteService.getNotes(),
              this.workspaceService.getUserWorkspaces(),
              this.taskService.getTasks(profile)
            ]).pipe(
              map(([notes, workspaces, tasks]) =>
                this.rankResults(q, notes, workspaces, tasks, filters)
              )
            );
          })
        );
      })
    );
  }

  searchDebounced(
    query$: Observable<string>,
    filters$: Observable<Partial<SearchFilters>> = of({}),
    debounceMs = 300
  ): Observable<SearchResult[]> {

    return combineLatest([query$, filters$]).pipe(
      debounceTime(debounceMs),
      switchMap(([query, filters]) => this.search(query, filters))
    );
  }

  private rankResults(
    q: string,
    notes: Note[],
    workspaces: Workspace[],
    tasks: Task[],
    filters: Partial<SearchFilters>
  ): SearchResult[] {

    const types = filters.types?.length
      ? filters.types
      : ['note', 'workspace', 'task'];

    const results: SearchResult[] = [];

    if (types.includes('note')) {

      for (const note of notes) {

        if (filters.priority && note.priority !== filters.priority) continue;
        if (filters.category && note.category !== filters.category) continue;
        if (filters.tags?.length
          && !filters.tags.some(t => note.tags?.includes(t))) continue;
        if (filters.dateFrom && note.updatedAt < filters.dateFrom) continue;
        if (filters.dateTo && note.updatedAt > filters.dateTo) continue;

        const score = this.scoreNote(q, note);

        if (score > 0) {
          results.push({
            type: 'note',
            id: note.id!,
            title: note.title || 'Untitled',
            subtitle: note.category,
            score,
            route: note.workspaceId
              ? ['/workspaces', note.workspaceId]
              : ['/notes', note.id!],
            meta: {
              priority: note.priority,
              updatedAt: String(note.updatedAt)
            }
          });
        }
      }
    }

    if (types.includes('workspace')) {

      for (const ws of workspaces) {

        const score = this.scoreText(q, ws.name, ws.description || '');

        if (score > 0) {
          results.push({
            type: 'workspace',
            id: ws.id!,
            title: ws.name,
            subtitle: `${ws.members?.length || 0} members`,
            score,
            route: ['/workspaces', ws.id!]
          });
        }
      }
    }

    if (types.includes('task')) {

      for (const task of tasks) {

        const score = this.scoreText(q, task.title, task.description);

        if (score > 0) {
          results.push({
            type: 'task',
            id: task.id!,
            title: task.title,
            subtitle: task.status,
            score,
            route: ['/tasks', task.id!],
            meta: { priority: task.priority }
          });
        }
      }
    }

    return results.sort((a, b) => b.score - a.score);
  }

  private scoreNote(q: string, note: Note): number {

    let score = this.scoreText(q, note.title, note.content);

    if (note.tags?.some(t => t.toLowerCase().includes(q))) {
      score += 15;
    }

    if (note.starredBy?.length) {
      score += 2;
    }

    if (note.isPinned) {
      score += 5;
    }

    const daysSinceUpdate =
      (Date.now() - note.updatedAt) / 86400000;

    if (daysSinceUpdate < 7) {
      score += 3;
    }

    return score;
  }

  private scoreText(q: string, title: string, body: string): number {

    const t = (title || '').toLowerCase();
    const b = this.stripHtml(body || '').toLowerCase();

    if (t === q) return 100;
    if (t.startsWith(q)) return 80;
    if (t.includes(q)) return 60;
    if (b.includes(q)) return 30;

    const words = q.split(/\s+/).filter(Boolean);

    if (words.length > 1) {
      const allInTitle = words.every(w => t.includes(w));
      const allInBody = words.every(w => b.includes(w));
      if (allInTitle) return 50;
      if (allInBody) return 25;
    }

    return 0;
  }

  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, ' ');
  }
}
