import { Injectable, inject } from '@angular/core';
import { switchMap, filter, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { StoreContextService } from './store-context.service';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class StoreCoordinatorService {
  private storeContext = inject(StoreContextService);
  private apiService = inject(ApiService);

  constructor() {
    // Subscribe to store slug changes and fetch store details
    this.storeContext.currentStoreSlug$.pipe(
      filter(slug => slug !== null), // Only proceed if slug is not null
      switchMap(slug => {
        console.log(`[StoreCoordinatorService] Fetching store details for slug: ${slug}`);
        return this.apiService.getStoreDetailsBySlug(slug!);
      }),
      tap(storeDetails => {
        console.log('[StoreCoordinatorService] Fetched store details:', storeDetails);
        this.storeContext.updateStoreDetails(storeDetails);
      })
    ).subscribe({
      error: (error) => {
        console.error('[StoreCoordinatorService] Error fetching store details:', error);
        this.storeContext.updateStoreDetails(null);
      }
    });

    // Handle null slug case
    this.storeContext.currentStoreSlug$.pipe(
      filter(slug => slug === null),
      tap(() => {
        console.log('[StoreCoordinatorService] Slug is null, clearing store details');
        this.storeContext.updateStoreDetails(null);
      })
    ).subscribe();
  }
} 