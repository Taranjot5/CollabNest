import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';

// Recover from stale lazy chunks after dev-server rebuilds (Vite HMR reconnect issues).
window.addEventListener('vite:preloadError', (event: Event) => {
  event.preventDefault();
  window.location.reload();
});

window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
  const message = event.reason?.message || String(event.reason || '');

  if (message.includes('Failed to fetch dynamically imported module')) {
    event.preventDefault();
    window.location.reload();
  }
});

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch(err => console.error(err));