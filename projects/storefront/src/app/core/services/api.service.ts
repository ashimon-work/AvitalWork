import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, switchMap, take, catchError, of } from 'rxjs';
import { Category, Product } from '@shared-types';
import { CarouselSlide } from '../../home/components/carousel/carousel.component';
import { StoreContextService } from './store-context.service';
@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private http = inject(HttpClient);
  private storeContext = inject(StoreContextService);
  private apiUrl = '/api';

  getFeaturedCategories(): Observable<Category[]> {
    return this.storeContext.currentStoreSlug$.pipe(
      take(1),
      switchMap(storeSlug => {
        let params = new HttpParams();
        if (storeSlug) {
          params = params.set('storeSlug', storeSlug);
        }
        return this.http.get<Category[]>(`${this.apiUrl}/categories/featured`, { params });
      })
    );
  }

  getFeaturedProducts(): Observable<Product[]> {
    return this.storeContext.currentStoreSlug$.pipe(
      take(1),
      switchMap(storeSlug => {
        let params = new HttpParams();
        if (storeSlug) {
          params = params.set('storeSlug', storeSlug);
        }
        return this.http.get<Product[]>(`${this.apiUrl}/products/featured`, { params });
      })
    );
  }

  getCategoryDetails(categoryId: string): Observable<Category | null> {
    return this.storeContext.currentStoreSlug$.pipe(
      take(1),
      switchMap(storeSlug => {
        let params = new HttpParams();
        if (storeSlug) {
          params = params.set('storeSlug', storeSlug);
        }
        return this.http.get<Category>(`${this.apiUrl}/categories/${categoryId}`, { params });
      })
    );
  }

  // Method to fetch products, potentially filtered, sorted, and paginated
  getProducts(queryParams: any): Observable<{ products: Product[], total: number }> {
    return this.storeContext.currentStoreSlug$.pipe(
      take(1),
      switchMap(storeSlug => {
        let httpParams = new HttpParams();
        if (storeSlug) {
          httpParams = httpParams.set('storeSlug', storeSlug);
        }
        Object.keys(queryParams).forEach(key => {
          if (queryParams[key] !== undefined && queryParams[key] !== null) {
            httpParams = httpParams.set(key, queryParams[key].toString());
          }
        });
        return this.http.get<{ products: Product[], total: number }>(`${this.apiUrl}/products`, { params: httpParams });
      })
    );
  }

  // Method for product search
  searchProducts(query: string): Observable<Product[]> {
    return this.storeContext.currentStoreSlug$.pipe(
      take(1),
      switchMap(storeSlug => {
        let params = new HttpParams().set('q', query);
        if (storeSlug) {
          params = params.set('storeSlug', storeSlug);
        }
        // Assuming the backend search endpoint is /api/search or maybe /api/products?q=...
        // Let's assume /api/products for now, consistent with getProducts
        return this.http.get<Product[]>(`${this.apiUrl}/products`, { params });
      })
    );
  }

  getProductDetails(productId: string): Observable<Product> {
    return this.storeContext.currentStoreSlug$.pipe(
      take(1),
      switchMap(storeSlug => {
        let params = new HttpParams();
        if (storeSlug) {
          params = params.set('storeSlug', storeSlug);
        }
        return this.http.get<Product>(`${this.apiUrl}/products/${productId}`, { params });
      })
    );
  }

  addToCart(payload: { productId: string, quantity: number }): Observable<any> {
    return this.http.post(`${this.apiUrl}/cart/add`, payload);
  }

  subscribeNewsletter(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/newsletter/subscribe`, { email });
  }

  getCart(): Observable<any> {
    return this.http.get(`${this.apiUrl}/cart`);
  }

  updateCartItemQuantity(productId: string, quantity: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/cart/${productId}`, { quantity });
  }

  removeCartItem(productId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/cart/${productId}`);
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/register`, userData);
  }

  getCarouselImages(): Observable<CarouselSlide[]> {
    return this.storeContext.currentStoreSlug$.pipe(
      take(1),
      switchMap(storeSlug => {
        let params = new HttpParams();
        if (storeSlug) {
          params = params.set('storeSlug', storeSlug);
        } else {
          console.error('Store slug is missing when fetching carousel images.');
        }
        console.log('Fetching carousel images from API');
        return this.http.get<CarouselSlide[]>(`${this.apiUrl}/carousel`, { params }).pipe(
          catchError(error => {
            console.error('Error fetching carousel images from API:', error);
            return of([]);
          })
        );
      })
    );
  }
}
