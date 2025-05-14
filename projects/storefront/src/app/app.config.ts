import { ApplicationConfig, provideZoneChangeDetection, inject } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { DOCUMENT } from '@angular/common';
import { provideAppInitializer } from '@angular/core';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { StoreContextService } from './core/services/store-context.service';

// This is the function that will be executed by APP_INITIALIZER.
// It directly contains the logic and inject() calls.
export function initializeStoreContext(): void {
  const storeContextService = inject(StoreContextService);
  const document = inject(DOCUMENT);
  
  // Get the initial path from window.location
  const initialPath = document.location.pathname;
  console.log('[APP_INITIALIZER] Initial Path:', initialPath);
  storeContextService.initializeSlugFromUrl(initialPath);
}


export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    StoreContextService,
    provideAppInitializer(initializeStoreContext),
  ],
};
