import { Component, OnInit } from '@angular/core';

import { Router } from '@angular/router';

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
    private afAuth: AngularFireAuth,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();
  }

  loadCurrentUser(): void {

    this.afAuth.authState.subscribe(user => {

      if (user) {
        this.currentUserId = user.uid;
        this.loadSharedNotes();
      }
    });
  }

  loadSharedNotes(): void {

    this.noteService.getNotes().subscribe(notes => {

      this.sharedNotes = notes.filter(
        note => note.createdBy !== this.currentUserId
      );
    });
  }

  openNote(id?: string): void {

    if (!id) return;

    this.router.navigate(['/notes', id]);
  }
}
