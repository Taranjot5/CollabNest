import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import { MatIconModule } from '@angular/material/icon';

import { SearchRoutingModule } from './search-routing.module';

import { GlobalSearchComponent } from './pages/global-search/global-search.component';

@NgModule({
  declarations: [GlobalSearchComponent],
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    SearchRoutingModule
  ]
})
export class SearchModule {}
