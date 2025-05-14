import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable, of, switchMap, map } from 'rxjs';
import { StoreContextService } from '../../core/services/store-context.service';
import { Order, User } from '@shared-types'; // Assuming Order and User interface are available

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private apiUrl = '/api/manager';

  constructor(
    private http: HttpClient,
    private storeContextService: StoreContextService
  ) { }
updateManagerCustomer(customerId: string, customerData: Partial<User>): Observable<User> {
  return this.storeContextService.currentStoreSlug$.pipe(
    switchMap(storeSlug => {
      if (!storeSlug) {
        throw new Error('Store slug not available');
      }
      const url = `${this.apiUrl}/${storeSlug}/customers/${customerId}`;
      return this.http.patch<User>(url, customerData);
    })
  );
}

// Add other customer-related methods here as needed
addManagerCustomerNote(customerId: string, noteContent: string): Observable<User> {
  return this.storeContextService.currentStoreSlug$.pipe(
    switchMap(storeSlug => {
      if (!storeSlug) {
        throw new Error('Store slug not available');
      }
      const url = `${this.apiUrl}/${storeSlug}/customers/${customerId}/notes`;
      return this.http.post<User>(url, { content: noteContent });
    })
  );
}

  sendManagerCustomerEmail(customerId: string, emailSubject: string, emailBody: string): Observable<any> { // Assuming this endpoint returns a simple success/failure, not the full User
    return this.storeContextService.currentStoreSlug$.pipe(
      switchMap(storeSlug => {
        if (!storeSlug) {
          throw new Error('Store slug not available');
        }
        const url = `${this.apiUrl}/${storeSlug}/customers/${customerId}/email`;
        return this.http.post(url, { subject: emailSubject, body: emailBody });
      })
    );
  }

  exportManagerCustomers(searchTerm: string = '', selectedFilter: string = ''): Observable<HttpResponse<Blob>> {
    return this.storeContextService.currentStoreSlug$.pipe(
      switchMap(storeSlug => {
        if (!storeSlug) {
          throw new Error('Store slug not available');
        }
        // Construct URL with optional query parameters for filtering/searching if needed
        const params: any = {};
        if (searchTerm) {
          params.searchTerm = searchTerm;
        }
        if (selectedFilter) {
          params.filter = selectedFilter;
        }

        const url = `${this.apiUrl}/${storeSlug}/customers/export`;
        return this.http.get(url, {
          responseType: 'blob',
          observe: 'response',
          params: params
        }).pipe(
          map(response => {
            // Return the full HttpResponse
            return response as HttpResponse<Blob>;
          })
        );
      })
    );
  }

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

        const apiUrl = `${this.apiUrl}/${storeSlug}/customers`;
        return this.http.get<{ data: any[]; total: number }>(apiUrl, { params });
      })
    );
  }
getManagerCustomerDetails(id: string): Observable<User> {
  return this.storeContextService.currentStoreSlug$.pipe(
    switchMap(storeSlug => {
      if (!storeSlug) {
        console.error('Store slug not available');
        // Depending on desired behavior, you might throw an error or return an empty observable
        throw new Error('Store slug not available');
      }
      const apiUrl = `${this.apiUrl}/${storeSlug}/customers/${id}`;
      return this.http.get<User>(apiUrl);
    })
  );
}

getManagerCustomerOrders(customerId: string): Observable<Order[]> {
  return this.storeContextService.currentStoreSlug$.pipe(
      switchMap(storeSlug => {
        if (!storeSlug) {
          console.error('Store slug not available for fetching customer orders');
          return of([]); // Return empty array if no slug
        }
        // TODO: Backend API endpoint required: GET /api/manager/{storeSlug}/customers/{customerId}/orders
        // For now, returning a mock empty array.
        console.warn(`Mock call for getManagerCustomerOrders for customer ${customerId} and store ${storeSlug}. Backend endpoint needed.`);
        return of([]); // Replace with actual HTTP call when backend is ready
        // Example of actual call:
        // const apiUrl = `${this.apiUrl}/${storeSlug}/customers/${customerId}/orders`;
        // return this.http.get<Order[]>(apiUrl);
      })
    );
  }
}