import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private apiUrl = '/api/manager/profile';

  constructor(private http: HttpClient) { }

  getManagerProfile(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  updateManagerPersonalInfo(profileData: any): Observable<any> {
    return this.http.patch<any>(this.apiUrl, profileData);
  }

  uploadManagerProfilePicture(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('profilePicture', file, file.name);
    return this.http.post<any>(`${this.apiUrl}/picture`, formData);
    // Assuming backend endpoint /api/manager/profile/picture handles multipart/form-data
  }

  changeManagerPassword(passwordData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/password`, passwordData);
  }

  initiateManager2faSetup(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/2fa/enable`, {});
  }
  confirmManager2faSetup(code: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/2fa/confirm`, { code }); // Corrected endpoint
  }

  disableManager2fa(verificationCode: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/2fa/disable`, { verificationCode });
  }

  getManager2faBackupCodes(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/2fa/backup-codes`);
  }

  getManagerNotificationPreferences(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/notification-preferences`);
  }

  updateManagerNotificationPreferences(preferences: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/notification-preferences`, preferences);
  }

  getManagerLoginHistory(page: number = 1, limit: number = 10): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/login-history`, { params: { page: page.toString(), limit: limit.toString() } });
  }
}

