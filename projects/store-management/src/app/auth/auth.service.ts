import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = '/api/manager'; // Base URL for manager API
  private readonly TOKEN_KEY = 'manager_auth_token';
  private currentUserSubject = new BehaviorSubject<any | null>(null); // Can be typed better
  public currentUser$ = this.currentUserSubject.asObservable();


  constructor(private http: HttpClient) {
    // Initialize user from token if available
    const token = this.getToken(); // Use the method to ensure consistent logging
    if (token) {
      console.log('AuthService constructor: Token found in localStorage on init.', token);
      // In a real app, you might want to decode the token to get user info
      // or make an API call to /api/manager/profile
      // For now, we'll assume the token means a user is logged in.
      // A more robust solution would involve verifying the token with the backend.
      this.currentUserSubject.next({ token }); // Simplified user object
    } else {
      console.log('AuthService constructor: No token found in localStorage on init.');
    }
  }

  login(credentials: any): Observable<any> {
    console.log('AuthService: Attempting login with', credentials);
    return this.http.post<{ accessToken: string, user: any }>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        if (response && response.accessToken) {
          console.log('AuthService login: Login successful, token received:', response.accessToken);
          localStorage.setItem(this.TOKEN_KEY, response.accessToken);
          this.currentUserSubject.next(response.user || { token: response.accessToken }); // Store user or simplified object
        } else {
          console.warn('AuthService login: Login response did not contain an accessToken.', response);
        }
      }, error => {
        console.error('AuthService login: Login failed.', error);
      })
    );
  }

  forgotPassword(email: string): Observable<any> {
    console.log('AuthService: Requesting password reset for', email);
    return this.http.post(`${this.apiUrl}/forgot-password`, { email });
  }

  logout(): void {
    console.log('AuthService logout: Clearing token and current user.');
    localStorage.removeItem(this.TOKEN_KEY);
    this.currentUserSubject.next(null);
    // Optionally, navigate to login page or notify backend
    // this.router.navigate(['/login']); // Consider storeSlug context if navigating
  }

  isAuthenticated(): Observable<boolean> {
    const token = this.getToken(); // getToken already logs
    const isAuthenticated = !!token;
    console.log('AuthService isAuthenticated: check returned', isAuthenticated);
    // Basic check: is there a token?
    // A more robust check would involve verifying the token's expiration and signature,
    // or even making a quick call to a backend endpoint like /api/manager/profile/status
    return of(isAuthenticated);
  }

  getToken(): string | null {
    const token = localStorage.getItem(this.TOKEN_KEY);
    console.log('AuthService getToken: Retrieved token from localStorage:', token);
    return token;
  }
}