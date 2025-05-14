import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, combineLatest } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Product } from '@shared-types';
import { StoreContextService } from '../core/services/store-context.service';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private apiUrl = '/api/manager';

  constructor(
    private http: HttpClient,
    private storeContextService: StoreContextService
  ) { }

  getProducts(
    searchTerm?: string,
    category?: string,
    status?: string,
    stockLevel?: string,
    page?: number,
    pageSize?: number,
    sortColumn?: string,
    sortDirection?: 'asc' | 'desc'
  ): Observable<{ products: Product[]; total: number }> { // Update return type to match backend response
    return this.storeContextService.currentStoreSlug$.pipe( // Use store context
      switchMap(storeSlug => {
        if (!storeSlug) {
          // Handle case where storeSlug is not available (e.g., initial load before route is fully resolved)
          // You might want to return an empty observable or throw an error depending on desired behavior
          return new Observable<{ products: Product[]; total: number }>();
        }

        let params = new HttpParams();
        params = params.set('storeSlug', storeSlug);

        if (searchTerm) {
          params = params.set('search', searchTerm);
        }
        if (category) {
          params = params.set('category', category);
        }
        if (status) {
          params = params.set('status', status);
        }
        if (stockLevel) {
          params = params.set('stock', stockLevel);
        }
        if (page) {
          params = params.set('page', page.toString());
        }
        if (pageSize) {
          params = params.set('pageSize', pageSize.toString());
        }
        if (sortColumn) {
          params = params.set('sortColumn', sortColumn);
        }
        if (sortDirection) {
          params = params.set('sortDirection', sortDirection);
        }

        return this.http.get<{ products: Product[]; total: number }>(`${this.apiUrl}/${storeSlug}/products`, { params });
      })
    );
  }

  getProductDetailsForManager(id: string | number): Observable<Product> {
    return this.storeContextService.currentStoreSlug$.pipe(
      switchMap(storeSlug => {
        if (!storeSlug) {
          return new Observable<Product>();
        }
        return this.http.get<Product>(`${this.apiUrl}/${storeSlug}/products/${id}`);
      })
    );
  }

  createProduct(productData: any): Observable<any> { // Replace 'any' with a proper product interface later
    return this.storeContextService.currentStoreSlug$.pipe(
      switchMap(storeSlug => {
        if (!storeSlug) {
          return new Observable<any>();
        }
        // Assuming the backend handles store association based on the storeSlug in the request body or headers
        // For now, we'll just pass the storeSlug in the body if needed, or rely on backend to get it from context
        // The backend expects the storeSlug in the URL path.
        return this.http.post<any>(`${this.apiUrl}/${storeSlug}/products`, productData);
      })
    );
  }

  updateProduct(id: string | number, productData: any): Observable<any> { // Replace 'any' with a proper product interface later
    return this.storeContextService.currentStoreSlug$.pipe(
      switchMap(storeSlug => {
        if (!storeSlug) {
          return new Observable<any>();
        }
        // Assuming the backend handles store association based on the storeSlug in the request body or headers
        // If backend expects it in query params or headers, adjust here.
        return this.http.patch<any>(`${this.apiUrl}/${storeSlug}/products/${id}`, productData);
      })
    );
  }

  deleteProduct(id: string | number): Observable<any> {
    return this.storeContextService.currentStoreSlug$.pipe(
      switchMap(storeSlug => {
        if (!storeSlug) {
          return new Observable<any>();
        }
        return this.http.delete<any>(`${this.apiUrl}/${storeSlug}/products/${id}`);
      })
    );
  }

  bulkDeleteProducts(productIds: string[]): Observable<any> {
    return this.storeContextService.currentStoreSlug$.pipe(
      switchMap(storeSlug => {
        if (!storeSlug) {
          return new Observable<any>();
        }
        // The backend expects an array of IDs in the request body
        return this.http.post<any>(`${this.apiUrl}/${storeSlug}/products/bulk-delete`, { productIds });
      })
    );
  }

  bulkUpdateProductStatus(productIds: string[], status: string): Observable<any> {
    return this.storeContextService.currentStoreSlug$.pipe(
      switchMap(storeSlug => {
        if (!storeSlug) {
          return new Observable<any>();
        }
        // The backend expects an array of IDs and the new status in the request body
        return this.http.post<any>(`${this.apiUrl}/${storeSlug}/products/bulk-update-status`, { productIds, status });
      })
    );
  }

  exportProducts(): Observable<Blob> {
    return this.storeContextService.currentStoreSlug$.pipe(
      switchMap(storeSlug => {
        if (!storeSlug) {
          // Handle case where storeSlug is not available
          return new Observable<Blob>();
        }
        // Make the GET request to the export endpoint
        // responseType: 'blob' is crucial for handling file downloads
        return this.http.get(`${this.apiUrl}/${storeSlug}/products/export`, { responseType: 'blob' });
      })
    );
  }
  importProducts(storeSlug: string, formData: FormData): Observable<any> {
    // The backend expects the storeSlug in the URL path.
    // The Content-Type header should not be explicitly set for FormData,
    // allowing the browser to set it correctly (e.g., multipart/form-data)
    return this.http.post<any>(`${this.apiUrl}/${storeSlug}/products/import`, formData);
  }
}