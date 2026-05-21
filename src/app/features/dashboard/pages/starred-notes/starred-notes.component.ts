import { Component, OnInit } from '@angular/core';

import { Router } from '@angular/router';

import { NoteService } from '../../../../core/services/note.service';

import { Note } from '../../../notes/models/note.model';

@Component({
  selector: 'app-starred-notes',
  templateUrl: './starred-notes.component.html',
  styleUrls: ['./starred-notes.component.scss']
})

export class StarredNotesComponent implements OnInit {

  starredNotes: Note[] = [];

  constructor(
    private noteService: NoteService,
    private router: Router
  ) {}

  ngOnInit(): void {

    this.loadStarredNotes();
  }

  loadStarredNotes() {

    this.noteService
      .getStarredNotes()
      .subscribe(notes => {

        this.starredNotes = notes;
      });
  }

  openNote(id?: string) {

    if (!id) return;

    this.router.navigate([
      '/notes',
      id
    ]);
  }
}