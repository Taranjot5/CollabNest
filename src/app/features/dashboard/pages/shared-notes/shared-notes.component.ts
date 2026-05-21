import { Component, OnInit } from '@angular/core';

import { AngularFireAuth } from '@angular/fire/compat/auth';

import { NoteService } from '../../../../core/services/note.service';

import { Note } from '../../../notes/models/note.model';

@Component({
  selector: 'app-shared-notes',
  templateUrl: './shared-notes.component.html',
  styleUrls: ['./shared-notes.component.scss']
})

export class SharedNotesComponent implements OnInit {

  sharedNotes: Note[] = [];

  currentUserId = '';

  constructor(
    private noteService: NoteService,
    private afAuth: AngularFireAuth
  ) {}

  ngOnInit(): void {

    this.loadCurrentUser();
  }

  // =========================
  // LOAD CURRENT USER
  // =========================

  loadCurrentUser() {

    this.afAuth.authState.subscribe(user => {

      if (user) {

        this.currentUserId = user.uid;

        this.loadSharedNotes();
      }
    });
  }

  // =========================
  // LOAD SHARED NOTES
  // =========================

  loadSharedNotes() {

    this.noteService
      .getNotes()
      .subscribe(notes => {

        this.sharedNotes = notes.filter(note =>

          note.createdBy !== this.currentUserId
        );
      });
  }
}