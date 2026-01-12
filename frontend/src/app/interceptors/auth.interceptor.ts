import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toastr = inject(ToastrService);

  // Add authorization header if token exists
  const token = authService.token;
  
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // Handle response
  return next(req).pipe(
    catchError((error) => {
      // Handle 401 Unauthorized
      if (error.status === 401) {
        authService.logout();
        router.navigate(['/login']);
        toastr.error('Session expired. Please login again.');
      }
      
      // Handle 403 Forbidden
      if (error.status === 403) {
        toastr.error('Access denied. Admin privileges required.');
      }
      
      // Handle validation errors
      if (error.status === 400 && error.error?.message) {
        toastr.error(error.error.message);
      }
      
      // Handle server errors
      if (error.status >= 500) {
        toastr.error('Server error. Please try again later.');
      }

      // Re-throw error
      return throwError(() => error);
    })
  );
};