import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';
import { User } from '@shared-types';

// Define interfaces for API responses if not already in shared-types
interface AuthResponse {
  access_token: string;
  user?: Omit<User, 'passwordHash'>;
  message?: string;
}

interface RegisterResponse {
  message: string;
  user: Omit<User, 'passwordHash'>;
}


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authApiUrl = '/api/auth';
  private accountApiUrl = '/api/account';
  private tokenKey = 'authToken';

  // BehaviorSubject to track authentication status
  private _isAuthenticated = new BehaviorSubject<boolean>(this.hasToken());
  public isAuthenticated$ = this._isAuthenticated.asObservable();

  // BehaviorSubject to store user info (optional, could fetch profile separately)
  private _currentUser = new BehaviorSubject<Omit<User, 'passwordHash'> | null>(null);
  public currentUser$ = this._currentUser.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute
  ) {
    // Optionally load user profile if token exists on init
    if (this.hasToken()) { this.loadUserProfile().subscribe(); }
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
    this._currentUser.next(null);
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
          // Get current storeSlug for redirection
          const storeSlug = this.route.snapshot.firstChild?.params['storeSlug'];
          if (storeSlug) {
            this.router.navigate(['/', storeSlug, 'account']);
          } else {
            console.error('AuthService: Could not determine storeSlug for redirect after login.');
            // Fallback? Maybe redirect to root or a generic error page?
            this.router.navigate(['/']); // Redirect to root as fallback
          }
        }
      }),
      catchError(this.handleError)
    );
  }

  register(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'roles' | 'passwordHash'> & { password: string }): Observable<RegisterResponse> {
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
    // Get current storeSlug for redirection
    // Need to get it asynchronously as logout might be called from anywhere
    // Use the root route's first child to find the component with the slug
    let currentRoute = this.router.routerState.root;
    while (currentRoute.firstChild) {
      currentRoute = currentRoute.firstChild;
    }
    const storeSlug = currentRoute.snapshot.params['storeSlug'];

    if (storeSlug) {
      this.router.navigate(['/', storeSlug, 'login']); // Redirect to store-specific login page
    } else {
      console.error('AuthService: Could not determine storeSlug for redirect after logout.');
      // Fallback? Maybe redirect to root or a generic error page?
      this.router.navigate(['/']); // Redirect to root as fallback
    }
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
        this.logout(); // Call logout which now handles redirection correctly
        return throwError(() => new Error('Failed to load user profile. Please log in again.'));
      })
    );
  }

  // Helper to get current user synchronously (use with caution, prefer observable)
  getCurrentUserSnapshot(): Omit<User, 'passwordHash'> | null {
    return this._currentUser.getValue();
  }

  // Method to update the current user state (e.g., after profile update)
  updateCurrentUserState(updatedUserInfo: Partial<Omit<User, 'passwordHash'>>): void {
    const currentUser = this.getCurrentUserSnapshot();
    if (currentUser) {
      // Merge the updated info with the current user state
      const newUserState = { ...currentUser, ...updatedUserInfo };
      this._currentUser.next(newUserState);
      console.log('AuthService: Updated current user state.');
    } else {
      console.warn('AuthService: Cannot update state, no current user loaded.');
    }
  }
}
