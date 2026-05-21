import { NgModule } from '@angular/core';

import {
  RouterModule,
  Routes
} from '@angular/router';

import { NotesListComponent } from './pages/notes-list/notes-list.component';

import { NoteDetailsComponent } from './pages/note-details/note-details.component';

const routes: Routes = [

  {
    path: '',
    component: NotesListComponent
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