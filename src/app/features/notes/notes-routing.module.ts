import { NgModule } from '@angular/core';

import {
  RouterModule,
  Routes
} from '@angular/router';

import { NotesListComponent } from './pages/notes-list/notes-list.component';

import { NoteDetailsComponent } from './pages/note-details/note-details.component';

import { TrashNotesComponent } from './pages/trash-notes/trash-notes.component';

const routes: Routes = [

  // =========================
  // NOTES LIST
  // =========================

  {
    path: '',
    component: NotesListComponent
  },

  // =========================
  // TRASH NOTES
  // =========================

  {
    path: 'trash',
    component: TrashNotesComponent
  },

  // =========================
  // NOTE DETAILS
  // =========================

  {
    path: ':id',
    component: NoteDetailsComponent
  }
];

@NgModule({

  imports: [
    RouterModule.forChild(routes)
  ],

  exports: [
    RouterModule
  ]
})

export class NotesRoutingModule {}