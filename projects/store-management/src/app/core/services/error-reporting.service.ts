import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ReportErrorPayload {
  url: string;
  comment?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ErrorReportingService {
  private http = inject(HttpClient);
  private apiUrl = '/api/manager/error-report';

  constructor() { }

  reportError(errorData: ReportErrorPayload): Observable<any> {
    // userId will be added by the backend based on the authenticated session
    return this.http.post<any>(this.apiUrl, errorData);
  }
}