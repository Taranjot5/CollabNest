import { Component } from '@angular/core';

import { Router, NavigationEnd } from '@angular/router';

import { filter } from 'rxjs/operators';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent {

  searchQuery = '';

  pageTitle = 'Knowledge Hub';

  private titleMap: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/dashboard/recent': 'Recent Notes',
    '/dashboard/shared': 'Shared Notes',
    '/dashboard/starred': 'Starred Notes',
    '/notes': 'Notes',
    '/notes/trash': 'Trash',
    '/notifications': 'Notifications',
    '/workspaces': 'Workspaces',
    '/profile': 'Profile'
  };

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.updatePageTitle(event.urlAfterRedirects);
    });
  }

  updatePageTitle(url: string): void {

    const path = url.split('?')[0];

    if (this.titleMap[path]) {
      this.pageTitle = this.titleMap[path];
      return;
    }

    if (path.startsWith('/notes/')) {
      this.pageTitle = 'Note Details';
      return;
    }

    if (path.startsWith('/workspaces/')) {
      this.pageTitle = 'Workspace';
      return;
    }

    this.pageTitle = 'Knowledge Hub';
  }

  onSearch(): void {

    if (!this.searchQuery.trim()) return;

    this.router.navigate(['/notes'], {
      queryParams: { q: this.searchQuery.trim() }
    });
  }

  async logout(): Promise<void> {

    await this.authService.logout();

    this.router.navigate(['/auth/login']);
  }
}
