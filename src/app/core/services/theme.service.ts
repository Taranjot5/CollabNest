import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

export type ThemeMode = 'light' | 'dark';

const STORAGE_KEY = 'kh_theme';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  private themeSubject = new BehaviorSubject<ThemeMode>('light');

  theme$ = this.themeSubject.asObservable();

  constructor() {
    this.init();
  }

  private init(): void {

    const stored = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = stored || (prefersDark ? 'dark' : 'light');

    this.apply(theme);
  }

  get current(): ThemeMode {
    return this.themeSubject.value;
  }

  toggle(): void {
    this.set(this.current === 'light' ? 'dark' : 'light');
  }

  set(theme: ThemeMode): void {
    this.apply(theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }

  private apply(theme: ThemeMode): void {

    const root = document.documentElement;

    root.classList.remove('theme-light', 'theme-dark');
    document.body.classList.remove('theme-light', 'theme-dark');

    root.classList.add(`theme-${theme}`);
    document.body.classList.add(`theme-${theme}`);
    root.setAttribute('data-theme', theme);

    this.themeSubject.next(theme);
  }
}
