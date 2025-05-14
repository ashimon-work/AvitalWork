import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Order, OrderListResponse, OrderQueryParams } from '@shared-types';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  constructor(
    private http: HttpClient
  ) { }

  private getManagerApiUrl(storeSlug: string): string {
    return `/api/manager/${storeSlug}/orders`;
  }

  getManagerOrders(storeSlug: string, params: OrderQueryParams): Observable<OrderListResponse> {
    if (!storeSlug) {
      // Handle case where storeSlug is not available
      console.error('Store slug not available');
      // Return an empty observable or throw an error
      return new Observable();
    }

    let httpParams = new HttpParams();
    if (params.page) {
      httpParams = httpParams.set('page', params.page.toString());
    }
    if (params.pageSize) {
      httpParams = httpParams.set('pageSize', params.pageSize.toString());
    }
    if (params.sortBy) {
      httpParams = httpParams.set('sortBy', params.sortBy);
    }
    if (params.sortDirection) {
      httpParams = httpParams.set('sortDirection', params.sortDirection);
    }
    if (params.status) {
      httpParams = httpParams.set('status', params.status);
    }
    if (params.startDate) {
      httpParams = httpParams.set('startDate', params.startDate);
    }
    if (params.endDate) {
      httpParams = httpParams.set('endDate', params.endDate);
    }
    if (params.search) {
      httpParams = httpParams.set('search', params.search);
    }

    return this.http.get<OrderListResponse>(this.getManagerApiUrl(storeSlug), { params: httpParams });
  }

  getManagerOrderDetails(storeSlug: string, orderId: string): Observable<Order> {
    if (!storeSlug) {
      console.error('Store slug not available');
      return new Observable();
    }
    if (!orderId) {
      console.error('Order ID not available');
      return new Observable();
    }
    return this.http.get<Order>(`${this.getManagerApiUrl(storeSlug)}/${orderId}`);
  }

  updateManagerOrderStatus(storeSlug: string, orderId: string, status: string): Observable<Order> {
    const url = `${this.getManagerApiUrl(storeSlug)}/${orderId}/status`;
    return this.http.patch<Order>(url, { status });
  }

  addManagerOrderNote(storeSlug: string, orderId: string, noteContent: string): Observable<Order> {
    const url = `${this.getManagerApiUrl(storeSlug)}/${orderId}/notes`;
    return this.http.post<Order>(url, { note: noteContent });
  }

  sendManagerOrderEmail(storeSlug: string, orderId: string, subject: string, body: string): Observable<Order> {
    const url = `${this.getManagerApiUrl(storeSlug)}/${orderId}/email`;
    return this.http.post<Order>(url, { subject, body });
  }

  addManagerOrderShipping(storeSlug: string, orderId: string, trackingNumber: string, shippingCarrier: string): Observable<Order> {
    const url = `${this.getManagerApiUrl(storeSlug)}/${orderId}/shipping`;
    return this.http.post<Order>(url, { trackingNumber, shippingCarrier });
  }

  generateManagerPackingSlip(storeSlug: string, orderId: string): Observable<Blob> {
    if (!storeSlug) {
      console.error('Store slug not available');
      return new Observable();
    }
    if (!orderId) {
      console.error('Order ID not available');
      return new Observable();
    }
    return this.http.get(`${this.getManagerApiUrl(storeSlug)}/${orderId}/packing-slip`, {
      responseType: 'blob'
    });
  }
  cancelManagerOrder(storeSlug: string, orderId: string): Observable<Order> {
    if (!storeSlug) {
      console.error('Store slug not available');
      return new Observable();
    }
    if (!orderId) {
      console.error('Order ID not available');
      return new Observable();
    }
    const url = `${this.getManagerApiUrl(storeSlug)}/${orderId}/cancel`;
    return this.http.patch<Order>(url, {});
  }
  exportManagerOrders(storeSlug: string, params: OrderQueryParams): Observable<Blob> {
    if (!storeSlug) {
      console.error('Store slug not available');
      return new Observable();
    }

    let httpParams = new HttpParams();
    if (params.status) {
      httpParams = httpParams.set('status', params.status);
    }
    if (params.startDate) {
      httpParams = httpParams.set('startDate', params.startDate);
    }
    if (params.endDate) {
      httpParams = httpParams.set('endDate', params.endDate);
    }
    if (params.search) {
      httpParams = httpParams.set('search', params.search);
    }
    // Note: Pagination and sorting parameters are typically not needed for export,
    // but including them here if the backend supports exporting filtered/sorted data.
    if (params.sortBy) {
      httpParams = httpParams.set('sortBy', params.sortBy);
    }
    if (params.sortDirection) {
      httpParams = httpParams.set('sortDirection', params.sortDirection);
    }


    const url = `${this.getManagerApiUrl(storeSlug)}/export`;
    return this.http.get(url, {
      params: httpParams,
      responseType: 'blob', // Important for handling file data
      observe: 'response' // To get headers for filename
    }).pipe(
      map(response => {
        // Extract filename from Content-Disposition header if available
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = 'orders.csv'; // Default filename
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="(.+)"/);
          if (filenameMatch && filenameMatch[1]) {
            filename = filenameMatch[1];
          }
        }
        // Attach filename to the blob for easier handling in the component
        const blob = response.body as Blob;
        (blob as any).filename = filename;
        return blob;
      })
    );
  }

  markOrderAsFulfilled(storeSlug: string, orderId: string): Observable<Order> {
    if (!storeSlug || !orderId) {
      console.error('Store slug or Order ID not available for marking as fulfilled');
      return new Observable(); // Or throw error
    }
    const url = `${this.getManagerApiUrl(storeSlug)}/${orderId}/fulfill`;
    return this.http.patch<Order>(url, {});
  }

  requestShippingLabel(storeSlug: string, orderId: string): Observable<{ message: string }> {
    if (!storeSlug || !orderId) {
      console.error('Store slug or Order ID not available for requesting shipping label');
      return new Observable(); // Or throw error
    }
    const url = `${this.getManagerApiUrl(storeSlug)}/${orderId}/shipping-label`;
    return this.http.get<{ message: string }>(url);
  }
}