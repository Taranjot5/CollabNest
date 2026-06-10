import { Component, OnDestroy, OnInit } from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';

import { Subject } from 'rxjs';

import { takeUntil } from 'rxjs/operators';

import { NoteService } from '../../../../core/services/note.service';

import { Note } from '../../models/note.model';

@Component({
  selector: 'app-note-details',
  templateUrl: './note-details.component.html',
  styleUrls: ['./note-details.component.scss']
})
export class NoteDetailsComponent implements OnInit, OnDestroy {

  noteId = '';

  note?: Note;

  loading = true;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private noteService: NoteService,
    private router: Router
  ) {}

  ngOnInit(): void {

    this.noteId = this.route.snapshot.paramMap.get('id') || '';

    this.noteService.getNoteById(this.noteId).pipe(
      takeUntil(this.destroy$)
    ).subscribe(note => {

      if (!note) {
        this.router.navigate(['/notes']);
        return;
      }

      this.note = note;
      this.loading = false;
    });
  }

  editNote(): void {
    this.router.navigate(['/notes', this.noteId, 'edit']);
  }

  goBack(): void {

    if (this.note?.workspaceId) {
      this.router.navigate(['/workspaces', this.note.workspaceId]);
      return;
    }

    this.router.navigate(['/notes']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
