import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, switchMap } from 'rxjs';
import { StoreContextService } from './core/services/store-context.service';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {

  constructor(
    private http: HttpClient,
    private storeContextService: StoreContextService
  ) { }

  getManagerCustomers(
    searchTerm?: string,
    filter?: string,
    page?: number,
    pageSize?: number,
    sortColumn?: string,
    sortDirection?: 'asc' | 'desc'
  ): Observable<{ data: any[]; total: number }> {
    return this.storeContextService.currentStoreSlug$.pipe(
      switchMap(storeSlug => {
        if (!storeSlug) {
          // Handle case where storeSlug is not available
          console.error('Store slug not available');
          return of({ data: [], total: 0 });
        }

        let params = new HttpParams();
        if (searchTerm) {
          params = params.set('searchTerm', searchTerm);
        }
        if (filter) {
          params = params.set('filter', filter);
        }
        if (page !== undefined) {
          params = params.set('page', page.toString());
        }
        if (pageSize !== undefined) {
          params = params.set('pageSize', pageSize.toString());
        }
        if (sortColumn) {
          params = params.set('sortColumn', sortColumn);
        }
        if (sortDirection) {
          params = params.set('sortDirection', sortDirection);
        }

        const apiUrl = `/api/manager/${storeSlug}/customers`;
        return this.http.get<{ data: any[]; total: number }>(apiUrl, { params });
      })
    );
  }
  getManagerCustomerDetails(id: string): Observable<any> { // Replace 'any' with a proper customer interface later
    return this.storeContextService.currentStoreSlug$.pipe(
      switchMap(storeSlug => {
        if (!storeSlug) {
          console.error('Store slug not available');
          // Depending on desired behavior, you might throw an error or return an empty observable
          throw new Error('Store slug not available');
        }
        const apiUrl = `/api/manager/${storeSlug}/customers/${id}`;
        return this.http.get<any>(apiUrl); // Replace 'any' with a proper customer interface later
      })
    );
  }

  // TODO: Add methods for other customer-related API calls (update, delete, etc.)
}