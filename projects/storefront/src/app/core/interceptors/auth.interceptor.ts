import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service'; // Import AuthService

// Functional Interceptor
export const authInterceptor: HttpInterceptorFn = (
    req: HttpRequest<unknown>,
    next: HttpHandlerFn
  ): Observable<HttpEvent<unknown>> => {

  const authService = inject(AuthService); // Inject AuthService using inject()
  const authToken = authService.getToken();
  let clonedRequest = req; // Start with the original request

  // Clone the request and add the authorization header if token exists
  // Don't add the header for login/register requests or external APIs
  if (authToken && req.url.startsWith('/api/')) { // Only add for our API calls
    // Avoid adding auth header to login/register itself if they are under /api/auth
    if (!req.url.includes('/api/auth/login') && !req.url.includes('/api/auth/register')) {
      clonedRequest = req.clone({
        setHeaders: {
          Authorization: `Bearer ${authToken}`
        }
      });
    }
  }

  return next(clonedRequest); // Pass the potentially cloned request to the next handler
};
