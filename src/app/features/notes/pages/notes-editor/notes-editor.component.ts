import { Component, OnDestroy, OnInit } from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';

import { Subject } from 'rxjs';

import { takeUntil } from 'rxjs/operators';

import { NoteService } from '../../../../core/services/note.service';

import { Note } from '../../models/note.model';

@Component({
  selector: 'app-notes-editor',
  templateUrl: './notes-editor.component.html',
  styleUrls: ['./notes-editor.component.scss']
})
export class NoteEditorComponent implements OnInit, OnDestroy {

  noteId = '';

  isEdit = false;

  title = '';

  content = '';

  category = 'Work';

  priority: 'High' | 'Medium' | 'Low' = 'Medium';

  tagsInput = '';

  workspaceId = '';

  loading = true;

  saving = false;

  errorMessage = '';

  successMessage = '';

  categories = ['Work', 'Study', 'Personal', 'Ideas'];

  priorities: ('High' | 'Medium' | 'Low')[] = ['High', 'Medium', 'Low'];

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private noteService: NoteService
  ) {}

  ngOnInit(): void {

    this.noteId = this.route.snapshot.paramMap.get('id') || '';
    this.isEdit = !!this.noteId && this.noteId !== 'new';

    if (this.isEdit) {
      this.loadNote();
    } else {
      this.loading = false;
    }
  }

  loadNote(): void {

    this.noteService.getNoteById(this.noteId).pipe(
      takeUntil(this.destroy$)
    ).subscribe(note => {

      if (!note) {
        this.router.navigate(['/notes']);
        return;
      }

      this.title = note.title || '';
      this.content = note.content || '';
      this.category = note.category || 'Work';
      this.priority = (note.priority as 'High' | 'Medium' | 'Low') || 'Medium';
      this.tagsInput = note.tags?.join(', ') || '';
      this.workspaceId = note.workspaceId || '';
      this.loading = false;
    });
  }

  get backRoute(): string[] {

    if (this.workspaceId) {
      return ['/workspaces', this.workspaceId];
    }

    return this.isEdit
      ? ['/notes', this.noteId]
      : ['/notes'];
  }

  async save(): Promise<void> {

    if (!this.title.trim()) {
      this.errorMessage = 'Title is required';
      return;
    }

    this.saving = true;
    this.errorMessage = '';
    this.successMessage = '';

    const tags = this.tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    try {

      if (this.isEdit) {
        await this.noteService.updateNote(this.noteId, {
          title: this.title.trim(),
          content: this.content,
          category: this.category,
          priority: this.priority,
          tags
        });

        this.successMessage = 'Note saved';
        setTimeout(() => this.router.navigate(this.backRoute), 600);
      } else {
        await this.noteService.createNote(
          this.title.trim(),
          this.content,
          this.category,
          this.priority
        );

        this.router.navigate(['/notes']);
      }

    } catch (err: any) {
      this.errorMessage = err.message || 'Failed to save note';
    } finally {
      this.saving = false;
    }
  }

  cancel(): void {
    this.router.navigate(this.backRoute);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
