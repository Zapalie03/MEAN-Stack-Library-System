import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  console.log('Admin Guard Checking...');
  console.log('Current URL:', window.location.pathname);
  console.log('Current User:', authService.currentUserValue);
  console.log('Is Admin?', authService.isAdmin);
  console.log('Is Logged In?', authService.isLoggedIn());
  
  if (!authService.isLoggedIn()) {
    console.log('Not logged in, redirecting to login');
    router.navigate(['/login']);
    return false;
  }
  
  if (!authService.isAdmin) {
    console.log('Not an admin, redirecting to login');
    router.navigate(['/login']);
    return false;
  }
  
  console.log('Admin guard passed');
  return true;
};