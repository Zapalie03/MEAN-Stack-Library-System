import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { MemberService } from '../services/member.service';
import { AuthService } from '../services/auth.service';
import { NavbarComponent } from './navbar.component';
import { MemberRequest, MEMBERSHIP_TYPES } from '../models/member.model';

@Component({
  selector: 'app-member-add',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavbarComponent],
  template: `
    <div class="container-fluid p-0">
      <app-navbar></app-navbar>
      
      <div class="container mt-4">
        <div class="row justify-content-center">
          <div class="col-lg-8">
            <div class="card shadow">
              <div class="card-header bg-primary text-white">
                <h4 class="mb-0">
                  <i class="bi bi-person-plus me-2"></i>
                  Add New Member
                </h4>
              </div>
              
              <div class="card-body">
                <form [formGroup]="memberForm" (ngSubmit)="onSubmit()">
                  <!-- Name -->
                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label class="form-label">First Name *</label>
                      <input type="text" 
                             class="form-control" 
                             formControlName="firstName"
                             [class.is-invalid]="isFieldInvalid('firstName')"
                             placeholder="First name">
                      <div class="invalid-feedback" *ngIf="isFieldInvalid('firstName')">
                        First name is required
                      </div>
                    </div>
                    <div class="col-md-6 mb-3">
                      <label class="form-label">Last Name *</label>
                      <input type="text" 
                             class="form-control" 
                             formControlName="lastName"
                             [class.is-invalid]="isFieldInvalid('lastName')"
                             placeholder="Last name">
                      <div class="invalid-feedback" *ngIf="isFieldInvalid('lastName')">
                        Last name is required
                      </div>
                    </div>
                  </div>

                  <!-- Contact Information -->
                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label class="form-label">Email *</label>
                      <input type="email" 
                             class="form-control" 
                             formControlName="email"
                             [class.is-invalid]="isFieldInvalid('email')"
                             placeholder="email@example.com">
                      <div class="invalid-feedback" *ngIf="isFieldInvalid('email')">
                        Valid email is required
                      </div>
                    </div>
                    <div class="col-md-6 mb-3">
                      <label class="form-label">Phone *</label>
                      <input type="text" 
                             class="form-control" 
                             formControlName="phone"
                             [class.is-invalid]="isFieldInvalid('phone')"
                             placeholder="Phone number">
                      <div class="invalid-feedback" *ngIf="isFieldInvalid('phone')">
                        Phone number is required
                      </div>
                    </div>
                  </div>

                  <!-- Address -->
                  <div class="mb-3">
                    <label class="form-label">Street Address</label>
                    <input type="text" 
                           class="form-control" 
                           formControlName="street"
                           placeholder="Street address">
                  </div>
                  <div class="row">
                    <div class="col-md-4 mb-3">
                      <input type="text" 
                             class="form-control" 
                             formControlName="city"
                             placeholder="City">
                    </div>
                    <div class="col-md-4 mb-3">
                      <input type="text" 
                             class="form-control" 
                             formControlName="state"
                             placeholder="State">
                    </div>
                    <div class="col-md-4 mb-3">
                      <input type="text" 
                             class="form-control" 
                             formControlName="zipCode"
                             placeholder="Zip Code">
                    </div>
                  </div>

                  <!-- Membership Information -->
                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label class="form-label">Membership Type *</label>
                      <select class="form-select" 
                              formControlName="membershipType"
                              [class.is-invalid]="isFieldInvalid('membershipType')">
                        <option value="">Select Type</option>
                        <option *ngFor="let type of membershipTypes" [value]="type">{{ type }}</option>
                      </select>
                      <div class="invalid-feedback" *ngIf="isFieldInvalid('membershipType')">
                        Please select membership type
                      </div>
                    </div>
                    <div class="col-md-6 mb-3">
                      <label class="form-label">Status</label>
                      <div class="form-check form-switch mt-2">
                        <input class="form-check-input" type="checkbox" role="switch" 
                               formControlName="isActive" id="flexSwitchCheckChecked" checked>
                        <label class="form-check-label" for="flexSwitchCheckChecked">
                          {{ memberForm.get('isActive')?.value ? 'Active' : 'Inactive' }}
                        </label>
                      </div>
                    </div>
                  </div>

                  <!-- Form Actions -->
                  <div class="d-flex justify-content-between">
                    <button type="button" 
                            class="btn btn-outline-secondary"
                            (click)="goBack()">
                      <i class="bi bi-arrow-left me-1"></i>Cancel
                    </button>
                    <button type="submit" 
                            class="btn btn-primary"
                            [disabled]="memberForm.invalid || isLoading">
                      <span *ngIf="isLoading" class="spinner-border spinner-border-sm me-2"></span>
                      <i class="bi" [class.bi-check-circle]="!isLoading" [class.bi-hourglass-split]="isLoading" me-1></i>
                      Add Member
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class MemberAddComponent {
  memberForm: FormGroup;
  isLoading = false;
  membershipTypes = MEMBERSHIP_TYPES;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private memberService: MemberService,
    private authService: AuthService,
    private toastr: ToastrService
  ) {
    console.log('🔧 MemberAddComponent initialized');
    
    this.memberForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      street: [''],
      city: [''],
      state: [''],
      zipCode: [''],
      membershipType: ['Regular', Validators.required],
      isActive: [true]
    });
  }

  onSubmit() {
    console.log('Form submitted');
    
    if (this.memberForm.invalid) {
      console.log('Form is invalid');
      this.memberForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    
    // Prepare member data
    const formValue = this.memberForm.value;
    const memberData: MemberRequest = {
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      email: formValue.email,
      phone: formValue.phone,
      membershipType: formValue.membershipType,
      isActive: formValue.isActive
    };
    
    // Add address if any field is filled
    if (formValue.street || formValue.city || formValue.state || formValue.zipCode) {
      memberData.address = {
        street: formValue.street,
        city: formValue.city,
        state: formValue.state,
        zipCode: formValue.zipCode
      };
    }
    
    console.log('Submitting member data:', memberData);

    this.memberService.createMember(memberData).subscribe({
      next: () => {
        console.log('Member added successfully');
        this.toastr.success('Member added successfully');
        this.isLoading = false;
        this.goBack();
      },
      error: (error) => {
        console.error('Error adding member:', error);
        this.isLoading = false;
        this.toastr.error(error.message || 'Failed to add member');
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.memberForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  goBack() {
    this.router.navigate(['/members']);
  }
}