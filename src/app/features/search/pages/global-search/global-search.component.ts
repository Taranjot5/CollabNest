import { Component, OnDestroy, OnInit } from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';

import { Subject } from 'rxjs';

import { takeUntil } from 'rxjs/operators';

import {
  GlobalSearchService,
  SearchFilters,
  SearchResult,
  SearchResultType
} from '../../../../core/services/global-search.service';

@Component({
  selector: 'app-global-search',
  templateUrl: './global-search.component.html',
  styleUrls: ['./global-search.component.scss']
})
export class GlobalSearchComponent implements OnInit, OnDestroy {

  query = '';

  results: SearchResult[] = [];

  loading = false;

  typeFilter: SearchResultType | 'all' = 'all';

  priorityFilter = '';

  categoryFilter = '';

  private querySubject = new Subject<string>();

  private filtersSubject = new Subject<Partial<SearchFilters>>();

  private destroy$ = new Subject<void>();

  constructor(
    private searchService: GlobalSearchService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {

    this.route.queryParams.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      this.query = params['q'] || '';
      this.typeFilter = params['type'] || 'all';
      this.priorityFilter = params['priority'] || '';
      this.categoryFilter = params['category'] || '';
      this.runSearch();
    });

    this.searchService.searchDebounced(
      this.querySubject,
      this.filtersSubject
    ).pipe(
      takeUntil(this.destroy$)
    ).subscribe(results => {
      this.results = results;
      this.loading = false;
    });
  }

  onQueryChange(): void {

    this.loading = true;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { q: this.query || null },
      queryParamsHandling: 'merge'
    });

    this.querySubject.next(this.query);
    this.filtersSubject.next(this.buildFilters());
  }

  onFilterChange(): void {

    this.loading = true;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        type: this.typeFilter !== 'all' ? this.typeFilter : null,
        priority: this.priorityFilter || null,
        category: this.categoryFilter || null
      },
      queryParamsHandling: 'merge'
    });

    this.filtersSubject.next(this.buildFilters());
    this.querySubject.next(this.query);
  }

  runSearch(): void {

    if (!this.query.trim()) {
      this.results = [];
      return;
    }

    this.loading = true;
    this.querySubject.next(this.query);
    this.filtersSubject.next(this.buildFilters());
  }

  openResult(result: SearchResult): void {
    this.router.navigate(result.route);
  }

  getTypeIcon(type: SearchResultType): string {

    const icons: Record<SearchResultType, string> = {
      note: 'description',
      workspace: 'folder_shared',
      task: 'task_alt'
    };

    return icons[type];
  }

  getTypeLabel(type: SearchResultType): string {
    return type.charAt(0).toUpperCase() + type.slice(1);
  }

  private buildFilters(): Partial<SearchFilters> {

    return {
      types: this.typeFilter === 'all'
        ? undefined
        : [this.typeFilter],
      priority: this.priorityFilter || undefined,
      category: this.categoryFilter || undefined
    };
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
