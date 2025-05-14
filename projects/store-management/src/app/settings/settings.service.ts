import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface GeneralSettings {
  storeName: string;
  storeEmail: string;
  storePhone?: string;
  storeAddress?: string;
  currency: string;
  timezone: string;
  // Add other general settings fields here
}

export interface ShippingSettings {
  defaultShippingRate: number;
  freeShippingThreshold?: number;
  // Add other shipping settings fields here
}

export interface PaymentSettings {
  acceptedPaymentMethods: string[];
  stripeApiKey?: string;
  paypalClientId?: string;
  // Add other payment settings fields here
}

export interface TaxSettings {
  taxRate: number;
  pricesIncludeTax: boolean;
  // Add other tax settings fields here
}

export interface NotificationSettings {
  adminEmailForOrders: string;
  customerEmailForOrders: boolean;
  // Add other notification settings fields here
}

export interface UsersPermissionsSettings {
  allowRegistration: boolean;
  defaultRole: string;
  // Add other users & permissions settings fields here
}

export interface AppearanceSettings {
  themeColor: string;
  logoUrl?: string;
  // Add other appearance settings fields here
}

export interface IntegrationsSettings {
  googleAnalyticsId?: string;
  facebookPixelId?: string;
  // Add other integrations settings fields here
}

export type SettingCategoryData =
  | GeneralSettings
  | ShippingSettings
  | PaymentSettings
  | TaxSettings
  | NotificationSettings
  | UsersPermissionsSettings
  | AppearanceSettings
  | IntegrationsSettings;


@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private apiUrl = '/api/manager'; // Base API URL

  constructor(private http: HttpClient) { }

  getManagerSettingsByCategory(storeSlug: string, category: string): Observable<any> {
    // TODO: Replace with actual API call and define specific types for each category
    console.log(`SettingsService: Fetching settings for ${storeSlug}, category: ${category}`);
    // Example: return this.http.get<any>(`${this.apiUrl}/${storeSlug}/settings/${category}`);
    // For now, returning mock data based on category
    let mockData: SettingCategoryData | null = null;
    switch (category) {
      case 'general':
        mockData = { storeName: 'My Awesome Store', storeEmail: 'contact@mystore.com', currency: 'USD', timezone: 'UTC' } as GeneralSettings;
        break;
      case 'shipping':
        mockData = { defaultShippingRate: 5.99, freeShippingThreshold: 50 } as ShippingSettings;
        break;
      case 'payments':
        mockData = { acceptedPaymentMethods: ['credit_card', 'paypal'] } as PaymentSettings;
        break;
      case 'taxes':
        mockData = { taxRate: 0.07, pricesIncludeTax: false } as TaxSettings;
        break;
      case 'notifications':
        mockData = { adminEmailForOrders: 'admin@mystore.com', customerEmailForOrders: true } as NotificationSettings;
        break;
      case 'users-permissions':
        mockData = { allowRegistration: true, defaultRole: 'customer' } as UsersPermissionsSettings;
        break;
      case 'appearance':
        mockData = { themeColor: '#007bff' } as AppearanceSettings;
        break;
      case 'integrations':
        mockData = { googleAnalyticsId: 'UA-XXXXX-Y' } as IntegrationsSettings;
        break;
      default:
        // mockData remains null if category is not matched
        break;
    }
    return of(mockData).pipe(
      map(data => ({ ...data })), // Ensure a copy is returned
      catchError(this.handleError<any>(`getManagerSettingsByCategory category=${category}`))
    );
  }

  updateManagerSettingsByCategory(storeSlug: string, category: string, settings: any): Observable<any> {
    // TODO: Replace with actual API call
    console.log(`SettingsService: Updating settings for ${storeSlug}, category: ${category}`, settings);
    // Example: return this.http.put(`${this.apiUrl}/${storeSlug}/settings/${category}`, settings);
    return of({ success: true, category, settings }).pipe(
      catchError(this.handleError<any>(`updateManagerSettingsByCategory category=${category}`))
    );
  }

  resetManagerSettingsByCategory(storeSlug: string, category: string): Observable<any> {
    // TODO: Replace with actual API call
    // This endpoint might be POST /api/manager/:storeSlug/settings/:category/reset
    console.log(`SettingsService: Resetting settings for ${storeSlug}, category: ${category}`);
    // Example: return this.http.post(`${this.apiUrl}/${storeSlug}/settings/${category}/reset`, {});
    // For now, just refetch (mocked) settings as if reset happened
    return this.getManagerSettingsByCategory(storeSlug, category).pipe(
       map(settings => ({ success: true, message: `${category} settings reset to defaults.`, settings })),
       catchError(this.handleError<any>(`resetManagerSettingsByCategory category=${category}`))
    );
  }

  testManagerEmailConfiguration(storeSlug: string, recipientEmail: string): Observable<any> {
    // TODO: Replace with actual API call: POST /api/manager/:storeSlug/settings/test-email
    console.log(`SettingsService: Testing email for ${storeSlug} to ${recipientEmail}`);
    // Example: return this.http.post(`${this.apiUrl}/${storeSlug}/settings/test-email`, { recipientEmail });
    return of({ success: true, message: `Test email sent to ${recipientEmail}` }).pipe(
      catchError(this.handleError<any>('testManagerEmailConfiguration'))
    );
  }

  testManagerPaymentConfiguration(storeSlug: string, amount: number, currency: string): Observable<any> {
    // TODO: Replace with actual API call: POST /api/manager/:storeSlug/settings/test-payment
    console.log(`SettingsService: Testing payment for ${storeSlug}, amount: ${amount} ${currency}`);
    // Example: return this.http.post(`${this.apiUrl}/${storeSlug}/settings/test-payment`, { amount, currency });
    return of({ success: true, message: `Test payment initiated for ${amount} ${currency}` }).pipe(
      catchError(this.handleError<any>('testManagerPaymentConfiguration'))
    );
  }

  downloadManagerSettingsBackup(storeSlug: string): Observable<HttpResponse<Blob>> {
    // TODO: Replace with actual API call: GET /api/manager/:storeSlug/settings/backup
    console.log(`SettingsService: Downloading backup for ${storeSlug}`);
    // Example: return this.http.get(`${this.apiUrl}/${storeSlug}/settings/backup`, { observe: 'response', responseType: 'blob' });
    const mockBackup = { settingsVersion: '1.0', data: { general: { storeName: 'Backup Store' } } };
    const blob = new Blob([JSON.stringify(mockBackup, null, 2)], { type: 'application/json' });
    const headers = new HttpHeaders().set('content-disposition', `attachment; filename="settings_backup_${storeSlug}.json"`);
    return of(new HttpResponse<Blob>({ body: blob, headers, status: 200 })).pipe(
      catchError(this.handleError<HttpResponse<Blob>>('downloadManagerSettingsBackup'))
    );
  }

  restoreManagerSettings(storeSlug: string, backupData: any): Observable<any> {
    // TODO: Replace with actual API call: POST /api/manager/:storeSlug/settings/restore
    console.log(`SettingsService: Restoring backup for ${storeSlug}`, backupData);
    // Example: return this.http.post(`${this.apiUrl}/${storeSlug}/settings/restore`, backupData);
    return of({ success: true, message: 'Settings restored successfully from backup.' }).pipe(
      catchError(this.handleError<any>('restoreManagerSettings'))
    );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`, error);
      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }
}