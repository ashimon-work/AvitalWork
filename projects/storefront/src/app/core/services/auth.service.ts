import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { User } from '@shared-types'; // Assuming User interface exists in shared types

// Define interfaces for API responses if not already in shared-types
interface AuthResponse {
  access_token: string;
  user?: Omit<User, 'passwordHash'>; // Optional user info on login/register
  message?: string; // Optional message from backend
}

interface RegisterResponse {
  message: string;
  user: Omit<User, 'passwordHash'>;
}


@Injectable({
  providedIn: 'root' // Provided globally
})
export class AuthService {
  private authApiUrl = '/api/auth'; // Base URL for auth endpoints
  private accountApiUrl = '/api/account'; // Base URL for account endpoints
  private tokenKey = 'authToken'; // Key for storing token in localStorage

  // BehaviorSubject to track authentication status
  private _isAuthenticated = new BehaviorSubject<boolean>(this.hasToken());
  public isAuthenticated$ = this._isAuthenticated.asObservable();

  // BehaviorSubject to store user info (optional, could fetch profile separately)
  private _currentUser = new BehaviorSubject<Omit<User, 'passwordHash'> | null>(null);
  public currentUser$ = this._currentUser.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Optionally load user profile if token exists on init
    if (this.hasToken()) { this.loadUserProfile().subscribe(); } // Load profile on init if logged in
  }

  private hasToken(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }

  private storeToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
    this._isAuthenticated.next(true);
  }

  private removeToken(): void {
    localStorage.removeItem(this.tokenKey);
    this._isAuthenticated.next(false);
    this._currentUser.next(null); // Clear user info on logout
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.authApiUrl}/login`, credentials).pipe(
      tap(response => {
        if (response.access_token) {
          this.storeToken(response.access_token);
          // Fetch profile after successful login
          this.loadUserProfile().subscribe();
          this.router.navigate(['/account']); // Redirect to account page on successful login
        }
      }),
      catchError(this.handleError)
    );
  }

  register(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'roles' | 'passwordHash'> & {password: string}): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.authApiUrl}/register`, userData).pipe(
      tap(response => {
        // Optionally auto-login or just show success message
        console.log('Registration successful:', response.message);
        // Maybe navigate to login page: this.router.navigate(['/login']);
      }),
      catchError(this.handleError)
    );
  }

  logout(): void {
    this.removeToken();
    this.router.navigate(['/login']); // Redirect to login page on logout
  }

  // Basic error handler
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      // Client-side or network error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong.
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.error?.message || error.statusText}`;
      if (error.status === 401) {
        errorMessage = 'Invalid credentials. Please try again.';
      }
      // Add more specific error handling based on status codes if needed
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage)); // Return an observable error
  }

  // Method to load user profile using the stored token
  loadUserProfile(): Observable<Omit<User, 'passwordHash'>> {
    // Assumes a /api/account/profile endpoint protected by JwtAuthGuard
    return this.http.get<Omit<User, 'passwordHash'>>(`${this.accountApiUrl}/profile`).pipe(
      tap(user => this._currentUser.next(user)), // Store user data on success
      catchError(error => {
        // If profile fetch fails (e.g., token expired, unauthorized), log out
        console.error('Failed to load user profile:', error);
        this.logout();
        return throwError(() => new Error('Failed to load user profile. Please log in again.'));
      })
    );
  }

  // Helper to get current user synchronously (use with caution, prefer observable)
  getCurrentUserSnapshot(): Omit<User, 'passwordHash'> | null {
    return this._currentUser.getValue();
  }
}
