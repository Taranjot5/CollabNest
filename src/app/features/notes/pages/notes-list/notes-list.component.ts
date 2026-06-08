import { Component, OnInit } from '@angular/core';

import { Router, ActivatedRoute } from '@angular/router';

import { AngularFireAuth } from '@angular/fire/compat/auth';

import { NoteService } from '../../../../core/services/note.service';

import { Note } from '../../models/note.model';

@Component({
  selector: 'app-notes-list',
  templateUrl: './notes-list.component.html',
  styleUrls: ['./notes-list.component.scss']
})
export class NotesListComponent implements OnInit {

  notes: Note[] = [];

  starredNotes: Note[] = [];

  normalNotes: Note[] = [];

  title = '';

  content = '';

  category = 'Work';

  priority = 'Medium';

  searchText = '';

  selectedCategory = 'All';

  currentUserId = '';

  categories = [
    'Work',
    'Study',
    'Personal',
    'Ideas'
  ];

  constructor(
    private noteService: NoteService,
    private router: Router,
    private route: ActivatedRoute,
    private afAuth: AngularFireAuth
  ) { }

  // =========================
  // FILTERED STARRED NOTES
  // =========================

  get filteredStarredNotes() {

    return this.starredNotes.filter(note =>
      this.filterLogic(note)
    );
  }

  // =========================
  // FILTERED NORMAL NOTES
  // =========================

  get filteredNormalNotes() {

    return this.normalNotes.filter(note =>
      this.filterLogic(note)
    );
  }

  // =========================
  // FILTER LOGIC
  // =========================

  filterLogic(note: Note) {

    const matchesSearch =

      note.title
        .toLowerCase()
        .includes(this.searchText.toLowerCase())

      ||

      note.content
        .toLowerCase()
        .includes(this.searchText.toLowerCase());

    const matchesCategory =

      this.selectedCategory === 'All'
      ||
      note.category === this.selectedCategory;

    return matchesSearch && matchesCategory;
  }

  // =========================
  // INIT
  // =========================

  ngOnInit(): void {

    this.route.queryParams.subscribe(params => {

      if (params['q']) {
        this.searchText = params['q'];
      }
    });

    this.loadCurrentUser();

    this.loadNotes();
  }

  // =========================
  // LOAD CURRENT USER
  // =========================

  loadCurrentUser() {

    this.afAuth.authState.subscribe(user => {

      if (user) {

        this.currentUserId = user.uid;
      }
    });
  }

  // =========================
  // LOAD NOTES
  // =========================

  loadNotes() {

    this.noteService
      .getNotes()
      .subscribe(notes => {

        this.notes = notes;

        this.starredNotes = notes.filter(note =>

          note.starredBy?.includes(
            this.currentUserId
          )
        );

        this.normalNotes = notes.filter(note =>

          !note.starredBy?.includes(
            this.currentUserId
          )
        );
      });
  }

  // =========================
  // CREATE NOTE
  // =========================

  async createNote() {

    if (!this.title || !this.content) return;

    await this.noteService.createNote(
      this.title,
      this.content,
      this.category,
      this.priority
    );

    this.title = '';

    this.content = '';

    this.category = 'Work';

    this.priority = 'Medium';
  }

  // =========================
  // SHARE NOTE
  // =========================

  async shareNote(
    noteId?: string,
    email?: string
  ) {

    if (!noteId || !email) return;

    await this.noteService.shareNote(
      noteId,
      email
    );
  }

  // =========================
  // TOGGLE STAR
  // =========================

  async toggleStar(note: Note) {

    if (!note.id) return;

    await this.noteService.toggleStar(
      note.id,
      note.starredBy || []
    );
  }

  // =========================
  // OPEN NOTE
  // =========================

  openNote(id?: string) {

    if (!id) return;

    this.router.navigate([
      '/notes',
      id
    ]);
  }

  // =========================
  // DELETE NOTE
  // =========================

  async deleteNote(
    event: MouseEvent,
    id?: string
  ) {

    event.stopPropagation();

    if (!id) return;

    await this.noteService.deleteNote(id);
  }
}