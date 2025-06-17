import { ApplicationConfig, provideZoneChangeDetection, inject, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { DOCUMENT } from '@angular/common';
import { provideAppInitializer } from '@angular/core';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { StoreContextService } from './core/services/store-context.service';
import { StoreCoordinatorService } from './core/services/store-coordinator.service';
import { SharedI18nModule } from '@shared/i18n';

// This is the function that will be executed by APP_INITIALIZER.
// It returns a factory function that will be called in the proper injection context.
export function initializeStoreContext() {
  return () => {
    const storeContextService = inject(StoreContextService);
    const storeCoordinatorService = inject(StoreCoordinatorService);
    const document = inject(DOCUMENT);
    
    // Get the initial path from window.location
    const initialPath = document.location.pathname;
    console.log('[APP_INITIALIZER] Initial Path:', initialPath);
    storeContextService.initializeSlugFromUrl(initialPath);
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    StoreContextService,
    StoreCoordinatorService,
    provideAppInitializer(initializeStoreContext()),
    importProvidersFrom(SharedI18nModule),
  ],
};
