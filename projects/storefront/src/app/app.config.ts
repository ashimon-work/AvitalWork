import { ApplicationConfig, provideZoneChangeDetection, provideAppInitializer, inject } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { DOCUMENT } from '@angular/common';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { StoreContextService } from './core/services/store-context.service';

// Factory function for APP_INITIALIZER
export function initializeStoreContextFactory(storeContextService: StoreContextService, document: Document): () => Promise<void> | void {
  return () => {
    // Get the initial path from window.location
    const initialPath = document.location.pathname;
    console.log('[APP_INITIALIZER] Initial Path:', initialPath);
    storeContextService.initializeSlugFromUrl(initialPath);
    // No need to return a promise if initialization is synchronous
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAppInitializer(initializeStoreContextFactory(inject(StoreContextService), inject(DOCUMENT))),
    StoreContextService,
  ],
};
