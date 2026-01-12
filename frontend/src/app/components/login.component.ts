import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="container-fluid vh-100 d-flex align-items-center justify-content-center bg-light">
      <div class="row w-100 justify-content-center">
        <div class="col-md-5 col-lg-4">
          <div class="card shadow-lg border-0">
            <div class="card-header bg-primary text-white text-center py-4">
              <i class="bi bi-book fs-1 mb-3"></i>
              <h2 class="mb-0">Library Management System</h2>
              <p class="mb-0 mt-2 opacity-75">Sign in to your account</p>
            </div>
            
            <div class="card-body p-4">
              <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" novalidate>
                <!-- Email Field -->
                <div class="mb-3">
                  <label for="email" class="form-label">Email Address</label>
                  <div class="input-group">
                    <span class="input-group-text">
                      <i class="bi bi-envelope"></i>
                    </span>
                    <input
                      type="email"
                      id="email"
                      class="form-control"
                      formControlName="email"
                      placeholder="Enter your email"
                      [class.is-invalid]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched"
                    />
                  </div>
                  <div *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched" 
                       class="text-danger small mt-1">
                    <span *ngIf="loginForm.get('email')?.errors?.['required']">Email is required</span>
                    <span *ngIf="loginForm.get('email')?.errors?.['email']">Please enter a valid email</span>
                  </div>
                </div>

                <!-- Password Field -->
                <div class="mb-4">
                  <label for="password" class="form-label">Password</label>
                  <div class="input-group">
                    <span class="input-group-text">
                      <i class="bi bi-lock"></i>
                    </span>
                    <input
                      type="password"
                      id="password"
                      class="form-control"
                      formControlName="password"
                      placeholder="Enter your password"
                      [class.is-invalid]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
                    />
                  </div>
                  <div *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched" 
                       class="text-danger small mt-1">
                    <span *ngIf="loginForm.get('password')?.errors?.['required']">Password is required</span>
                    <span *ngIf="loginForm.get('password')?.errors?.['minlength']">
                      Password must be at least 6 characters
                    </span>
                  </div>
                </div>

                <!-- Submit Button -->
                <div class="d-grid mb-3">
                  <button 
                    type="submit" 
                    class="btn btn-primary btn-lg"
                    [disabled]="loginForm.invalid || isLoading"
                  >
                    <span *ngIf="isLoading" class="spinner-border spinner-border-sm me-2"></span>
                    {{ isLoading ? 'Signing in...' : 'Sign In' }}
                  </button>
                </div>

                <!-- Error Message -->
                <div *ngIf="errorMessage" class="alert alert-danger text-center py-2">
                  {{ errorMessage }}
                </div>

                <!-- Register Link -->
                <div class="text-center mt-4">
                  <p class="mb-0">Don't have an account? 
                    <a routerLink="/register" class="text-primary text-decoration-none fw-semibold">
                      Create one here
                    </a>
                  </p>
                </div>
              </form>
            </div>

            <div class="card-footer text-center py-3 bg-light">
             <small class="text-muted">
  <i class="bi bi-info-circle me-1"></i>
  Demo: admin@library.com / admin123
</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card {
      border-radius: 15px;
      overflow: hidden;
    }
    
    .card-header {
      border-radius: 15px 15px 0 0 !important;
    }
    
    .input-group-text {
      background-color: #f8f9fa;
      border-right: none;
    }
    
    .form-control:focus {
      border-color: #4361ee;
      box-shadow: 0 0 0 0.2rem rgba(67, 97, 238, 0.25);
    }
    
    .form-control.is-invalid {
      border-color: #dc3545;
    }
    
    .btn-primary {
      background-color: #4361ee;
      border-color: #4361ee;
      padding: 12px;
      font-weight: 600;
    }
    
    .btn-primary:hover:not(:disabled) {
      background-color: #3a56d4;
      border-color: #3a56d4;
      transform: translateY(-1px);
      transition: all 0.2s;
    }
    
    .btn-primary:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
    
    .spinner-border {
      width: 1rem;
      height: 1rem;
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {
    // Initialize the form with validation
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

onSubmit() {
  if (this.loginForm.invalid) {
    this.loginForm.markAllAsTouched();
    return;
  }

  this.isLoading = true;
  this.errorMessage = '';

  const credentials = this.loginForm.value;

  this.authService.login(credentials).subscribe({
    next: (response) => {
      this.isLoading = false;
      this.toastr.success('Login successful!', 'Welcome');
      
      // Force navigation without any delay
      console.log('Redirecting to dashboard...');
      
      // Try multiple navigation methods
      this.router.navigate(['/dashboard']).then(success => {
        if (success) {
          console.log('Navigation successful');
        } else {
          console.log('Navigation failed, trying window.location');
          window.location.href = '/dashboard';
        }
      }).catch(err => {
        console.error('Navigation error:', err);
        window.location.href = '/dashboard';
      });
    },
    error: (error) => {
      this.isLoading = false;
      console.error('Login error details:', error);
      
      // Better error messages
      if (error.message.includes('Cannot connect')) {
        this.errorMessage = 'Cannot connect to server. Make sure backend is running on port 3000.';
      } else {
        this.errorMessage = error.message || 'Invalid email or password';
      }
      
      this.toastr.error(this.errorMessage, 'Login Failed');
    }
  });
}

  // Helper method to check field validity
  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }
}