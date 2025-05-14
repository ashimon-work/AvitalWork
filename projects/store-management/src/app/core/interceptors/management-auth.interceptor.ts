import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../auth/auth.service';

@Injectable()
export class ManagementAuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    console.log('ManagementAuthInterceptor: TOP OF INTERCEPT METHOD for URL:', request.url);
    const token = this.authService.getToken();
    console.log('ManagementAuthInterceptor: Intercepting request to', request.url);

    // Clone the request to add the new header.
    // We only want to add the token for API calls, not for other requests (e.g., loading templates)
    // and only if the token exists.
    // We only want to add the token for API calls, not for other requests (e.g., loading templates)
    // and only if the token exists. Exclude auth endpoints.
    const isApiUrl = request.url.includes('/api/');
    const isLoginUrl = request.url.includes('/api/auth/manager/login');
    const isForgotPasswordUrl = request.url.includes('/api/auth/manager/forgot-password');
    const isAuthUrl = isLoginUrl || isForgotPasswordUrl;

    if (token && isApiUrl && !isAuthUrl) {
      console.log('ManagementAuthInterceptor: Token found, attaching to request for', request.url);
      const authReq = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
      return next.handle(authReq);
    } else if (!token && isApiUrl && !isAuthUrl) {
      console.warn('ManagementAuthInterceptor: No token found, but request is to API. Request will proceed without Authorization header for', request.url);
    } else {
      console.log('ManagementAuthInterceptor: Request does not require token, is an auth URL, or token not present. Passing through for', request.url);
    }

    // For requests without a token or not to the API, pass them through unchanged.
    return next.handle(request);
  }
}