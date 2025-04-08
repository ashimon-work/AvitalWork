import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
// Removed AuthService import to break circular dependency

// Functional Interceptor
export const authInterceptor: HttpInterceptorFn = (
    req: HttpRequest<unknown>,
    next: HttpHandlerFn
  ): Observable<HttpEvent<unknown>> => {

  // Directly access localStorage to avoid injecting AuthService and causing circular dependency
  const tokenKey = 'authToken'; // Use the same key as in AuthService
  const authToken = localStorage.getItem(tokenKey);
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
