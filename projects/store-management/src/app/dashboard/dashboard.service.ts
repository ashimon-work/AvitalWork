import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';

// Define a basic Notification interface for the frontend
export interface Notification {
  id: string;
  userId: string;
  type: string; // Should match NotificationType enum values
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  readAt?: Date | null;
  link?: string;
  severity: string; // Should match NotificationSeverity enum values
  // storeId?: string;
}


@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private managerApiUrl = '/api/manager'; // Base URL for general manager API
  private notificationsApiUrl = '/api/notifications'; // Base URL for notifications API

  constructor(private http: HttpClient) { }

  getDashboardData(storeSlug: string): Observable<any> {
    console.log('DashboardService: Fetching dashboard data for store', storeSlug);
    return this.http.get(`${this.managerApiUrl}/${storeSlug}/dashboard`);
  }

  getSalesChartData(storeSlug: string, period: string): Observable<any> {
    console.log('DashboardService: Fetching sales chart data for store', storeSlug, 'period', period);
    return this.http.get(`${this.managerApiUrl}/${storeSlug}/sales/chart`, {
      params: { period }
    });
  }

  getRecentOrders(storeSlug: string, page: number, limit: number, sortColumn: string, sortDirection: 'asc' | 'desc'): Observable<any> {
    console.log('DashboardService: Fetching recent orders for store', storeSlug, 'with pagination and sorting', { page, limit, sortColumn, sortDirection });
    return this.http.get(`${this.managerApiUrl}/${storeSlug}/orders/recent`, {
      params: {
        page: page.toString(),
        limit: limit.toString(),
        sortColumn,
        sortDirection
      }
    });
  }

  getInventoryAlerts(storeSlug: string): Observable<any> {
    console.log('DashboardService: Fetching inventory alerts for store', storeSlug);
    return this.http.get(`${this.managerApiUrl}/${storeSlug}/inventory/alerts`);
  }

  // Notification methods
  getNotifications(storeSlug?: string): Observable<Notification[]> {
    let params = new HttpParams();
    if (storeSlug) {
      params = params.append('storeSlug', storeSlug);
    }
    console.log('DashboardService: Fetching notifications with params:', params.toString());
    return this.http.get<Notification[]>(this.notificationsApiUrl, { params });
  }

  markNotificationAsRead(notificationId: string): Observable<Notification> {
    console.log('DashboardService: Marking notification as read:', notificationId);
    return this.http.patch<Notification>(`${this.notificationsApiUrl}/${notificationId}`, { isRead: true });
  }

  markAllNotificationsAsRead(storeSlug?: string): Observable<{ updated: number }> {
    let params = new HttpParams();
    if (storeSlug) {
      params = params.append('storeSlug', storeSlug);
    }
    console.log('DashboardService: Marking all notifications as read with params:', params.toString());
    return this.http.post<{ updated: number }>(`${this.notificationsApiUrl}/mark-all-as-read`, null, { params });
  }

  clearAllNotifications(storeSlug?: string): Observable<{ deleted: number }> {
    // This maps to removeAllForUser in the backend, which deletes notifications
    let params = new HttpParams();
    if (storeSlug) {
      params = params.append('storeSlug', storeSlug);
    }
    console.log('DashboardService: Clearing (deleting) all notifications with params:', params.toString());
    return this.http.delete<{ deleted: number }>(`${this.notificationsApiUrl}/clear-all`, { params });
  }

  deleteNotification(notificationId: string): Observable<void> {
    console.log('DashboardService: Deleting notification:', notificationId);
    return this.http.delete<void>(`${this.notificationsApiUrl}/${notificationId}`);
  }
}