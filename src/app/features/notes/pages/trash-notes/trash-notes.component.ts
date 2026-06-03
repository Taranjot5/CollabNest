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

  // =========================
  // LOAD TRASH NOTES
  // =========================

  loadTrashNotes() {

    this.noteService
      .getTrashNotes()
      .subscribe(notes => {

        this.trashedNotes = notes;
      });
  }

  // =========================
  // RESTORE NOTE
  // =========================

  async restoreNote(id?: string) {

    if (!id) return;

    await this.noteService.restoreNote(id);
  }

  // =========================
  // DELETE FOREVER
  // =========================

  async deleteForever(id?: string) {

    if (!id) return;

    const confirmed =
      confirm(
        'Delete permanently?'
      );

    if (!confirmed) return;

    await this.noteService.deleteForever(id);
  }
}