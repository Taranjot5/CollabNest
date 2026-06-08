import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import { NotesRoutingModule } from './notes-routing.module';

import { NotesListComponent } from './pages/notes-list/notes-list.component';

import { NoteEditorComponent } from './pages/notes-editor/notes-editor.component';

import { NoteDetailsComponent } from './pages/note-details/note-details.component';

import { QuillModule } from 'ngx-quill';
import { MatIconModule } from '@angular/material/icon';
import { TrashNotesComponent } from './pages/trash-notes/trash-notes.component';

@NgModule({

  declarations: [

    NotesListComponent,

    NoteEditorComponent,

    NoteDetailsComponent,
     TrashNotesComponent
  ],

  imports: [

    CommonModule,

    FormsModule,

    NotesRoutingModule,

    QuillModule.forRoot(),

    MatIconModule
  ]
})

export class NotesModule {}