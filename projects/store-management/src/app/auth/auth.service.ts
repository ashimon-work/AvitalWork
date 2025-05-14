import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = '/api/manager'; // Base URL for manager API

  constructor(private http: HttpClient) { }

  login(credentials: any): Observable<any> {
    console.log('AuthService: Attempting login with', credentials);
    return this.http.post(`${this.apiUrl}/login`, credentials);
  }

  forgotPassword(email: string): Observable<any> {
    console.log('AuthService: Requesting password reset for', email);
    return this.http.post(`${this.apiUrl}/forgot-password`, { email });
  }
}