import { Component, OnInit } from '@angular/core';

import { Router } from '@angular/router';

import { NoteService } from '../../../../core/services/note.service';

import { Note } from '../../../notes/models/note.model';

@Component({
  selector: 'app-recent-notes',
  templateUrl: './recent-notes.component.html',
  styleUrls: ['./recent-notes.component.scss']
})
export class RecentNotesComponent implements OnInit {

  recentNotes: Note[] = [];

  constructor(
    private noteService: NoteService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadRecentNotes();
  }

  loadRecentNotes(): void {

    this.noteService.getNotes().subscribe(notes => {

      this.recentNotes = notes
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .slice(0, 10);
    });
  }

  openNote(id?: string): void {

    if (!id) return;

    this.router.navigate(['/notes', id]);
  }
}
