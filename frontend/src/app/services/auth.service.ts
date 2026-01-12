import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../../environments/environment';
import { User, AuthResponse, LoginRequest, RegisterRequest } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Initialize from localStorage
    const storedUser = localStorage.getItem('currentUser');
    this.currentUserSubject = new BehaviorSubject<User | null>(
      storedUser ? JSON.parse(storedUser) : null
    );
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  // Get current user value
  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  // Get token from localStorage
  public get token(): string | null {
    return localStorage.getItem('token');
  }

  // Check if user is admin
public get isAdmin(): boolean {
  const user = this.currentUserValue;
  console.log('🛡️ isAdmin getter called. User:', user);
  console.log('🛡️ User role:', user?.role);
  console.log('🛡️ Is admin?', user?.role === 'admin');
  return user?.role === 'admin';
}

  // Register new user
  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData)
      .pipe(
        map(response => {
          this.setSession(response);
          return response;
        }),
        catchError(this.handleError)
      );
  }

  // Login user - FIXED VERSION
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        map(response => {
          this.setSession(response);
          return response;
        }),
        catchError(this.handleError)
      );
  }

  // Get current user info
  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`)
      .pipe(catchError(this.handleError));
  }

  // Logout user
  logout(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  // Check if user is logged in - FIXED VERSION
  isLoggedIn(): boolean {
    const token = this.token;
    
    // If no token, not logged in
    if (!token) {
      return false;
    }

    // For testing with dummy token from test server
    if (token === 'test-token-123' || token === 'test-token-456') {
      return true;
    }

    try {
      // Try to decode the token
      const decoded: any = jwtDecode(token);
      
      // Check if token has expiration
      if (decoded.exp) {
        const currentTime = Date.now() / 1000;
        return decoded.exp > currentTime;
      }
      
      // If no expiration, assume valid
      return true;
    } catch (error) {
      console.log('Token decode error:', error);
      return false;
    }
  }

  // Private method to set session - ADD LOGGING
  private setSession(authResponse: AuthResponse): void {
    console.log('Setting session with:', authResponse);
    
    localStorage.setItem('currentUser', JSON.stringify(authResponse.user));
    localStorage.setItem('token', authResponse.token);
    
    // Force update of subject
    this.currentUserSubject.next(authResponse.user);
    
    console.log('Session set successfully');
    console.log('Token stored:', localStorage.getItem('token'));
    console.log('User stored:', localStorage.getItem('currentUser'));
    console.log('Current user subject:', this.currentUserSubject.value);
  }

  // Error handler
  private handleError(error: any): Observable<never> {
    console.error('Auth Service Error:', error);
    
    // Extract meaningful error message
    let errorMessage = 'An error occurred';
    
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.status === 401) {
      errorMessage = 'Invalid email or password';
    } else if (error.status === 0) {
      errorMessage = 'Cannot connect to server. Please check if backend is running.';
    }
    
    return throwError(() => new Error(errorMessage));
  }

  // New method to check authentication status quickly
  checkAuth(): boolean {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('currentUser');
    
    if (!token || !user) {
      return false;
    }
    
    return true;
  }
}