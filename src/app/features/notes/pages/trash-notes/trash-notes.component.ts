import { Component, OnInit } from '@angular/core';

import { NoteService } from '../../../../core/services/note.service';

import { Note } from '../../models/note.model';

@Component({
  selector: 'app-trash-notes',
  templateUrl: './trash-notes.component.html',
  styleUrls: ['./trash-notes.component.scss']
})

export class TrashNotesComponent
implements OnInit {

  trashedNotes: Note[] = [];

  constructor(
    private noteService: NoteService
  ) {}

  ngOnInit(): void {

    this.loadTrashNotes();
  }

  loadTrashNotes() {

    this.noteService
      .getTrashNotes()
      .subscribe(notes => {

        this.trashedNotes = notes;
      });
  }

  async restoreNote(id?: string) {

    if (!id) return;

    await this.noteService.restoreNote(id);
  }

  async deleteForever(id?: string) {

    if (!id) return;

    await this.noteService.deleteForever(id);
  }
}