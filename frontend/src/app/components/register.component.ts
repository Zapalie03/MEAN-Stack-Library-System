import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="container-fluid vh-100 d-flex align-items-center justify-content-center bg-light">
      <div class="row w-100 justify-content-center">
        <div class="col-md-5 col-lg-4">
          <div class="card shadow-lg border-0">
            <div class="card-header bg-success text-white text-center py-4">
              <i class="bi bi-person-plus fs-1 mb-3"></i>
              <h2 class="mb-0">Create Account</h2>
            </div>
            
            <div class="card-body p-4">
              <p class="text-center text-muted mb-4">
                Fill in your details to create a new account
              </p>
              
              <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
                <div class="mb-3">
                  <label class="form-label">Name</label>
                  <input type="text" class="form-control" formControlName="name" placeholder="Your name">
                </div>
                
                <div class="mb-3">
                  <label class="form-label">Email</label>
                  <input type="email" class="form-control" formControlName="email" placeholder="Your email">
                </div>
                
                <div class="mb-3">
                  <label class="form-label">Password</label>
                  <input type="password" class="form-control" formControlName="password" placeholder="Min. 6 characters">
                </div>
                
                <div class="mb-4">
                  <label class="form-label">Role</label>
                  <select class="form-select" formControlName="role">
                    <option value="user">Regular User</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                
                <div class="d-grid gap-2">
                  <button type="submit" class="btn btn-success btn-lg" [disabled]="isLoading">
                    {{ isLoading ? 'Creating Account...' : 'Create Account' }}
                  </button>
                  <button type="button" routerLink="/login" class="btn btn-outline-secondary">
                    Back to Login
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['user']
    });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.authService.register(this.registerForm.value).subscribe({
        next: () => {
          this.toastr.success('Account created successfully!');
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.isLoading = false;
          this.toastr.error(error.message || 'Registration failed');
        }
      });
    }
  }
}