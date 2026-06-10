import { NgModule } from '@angular/core';

import {
  RouterModule,
  Routes
} from '@angular/router';

import { NotesListComponent } from './pages/notes-list/notes-list.component';

import { NoteDetailsComponent } from './pages/note-details/note-details.component';

import { NoteEditorComponent } from './pages/notes-editor/notes-editor.component';

import { TrashNotesComponent } from './pages/trash-notes/trash-notes.component';

import { roleGuard } from '../../core/guards/role.guard';

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
    path: 'new',
    component: NoteEditorComponent
  },

  {
    path: 'trash',
    component: TrashNotesComponent,
    canActivate: [roleGuard],
    data: { permission: 'trash' }
  },

  {
    path: ':id/edit',
    component: NoteEditorComponent
  },

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