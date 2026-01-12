import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  console.log('Auth Guard Checking...');
  console.log('Current URL:', window.location.pathname);
  console.log('Current User:', authService.currentUserValue);
  console.log('Is Logged In?', authService.isLoggedIn());
  
  if (authService.isLoggedIn()) {
    console.log('Auth guard passed');
    return true;
  }
  
  console.log('Not authenticated, redirecting to login');
  router.navigate(['/login']);
  return false;
};