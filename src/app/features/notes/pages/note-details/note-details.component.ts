import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NoteService } from '../../../../core/services/note.service';
import { Note } from '../../models/note.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-note-details',
  templateUrl: './note-details.component.html',
  styleUrls: ['./note-details.component.scss']
})
export class NoteDetailsComponent implements OnInit {

  noteId = '';

  note?: Note;

  constructor(
    private route: ActivatedRoute,
    private noteService: NoteService,
    private router: Router
  ) {}

  ngOnInit(): void {

    this.noteId = this.route.snapshot.paramMap.get('id') || '';

    this.noteService
      .getNoteById(this.noteId)
      .subscribe(note => {

        if (note) {
          this.note = note;
        }
      });
  }

  async saveNote() {

    if (!this.note || !this.note.id) return;

    await this.noteService.updateNote(
      this.note.id,
      {
        title: this.note.title,
        content: this.note.content,
        category: this.note.category,
        priority: this.note.priority
      }
    );

    this.router.navigate(['/notes']);
  }
}