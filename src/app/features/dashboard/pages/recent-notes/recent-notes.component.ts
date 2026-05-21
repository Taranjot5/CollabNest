import { Component, OnInit } from '@angular/core';

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
    private noteService: NoteService
  ) {}

  ngOnInit(): void {

    this.loadRecentNotes();
  }

  // =========================
  // LOAD RECENT NOTES
  // =========================

  loadRecentNotes() {

    this.noteService
      .getNotes()
      .subscribe(notes => {

        this.recentNotes = notes
          .sort((a, b) => b.updatedAt - a.updatedAt)
          .slice(0, 10);
      });
  }
}