import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { MemberService } from '../services/member.service';
import { AuthService } from '../services/auth.service';
import { NavbarComponent } from './navbar.component';
import { MemberRequest, MEMBERSHIP_TYPES } from '../models/member.model';

@Component({
  selector: 'app-member-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, NavbarComponent],
  template: `
    <div class="container-fluid p-0">
      <app-navbar></app-navbar>
      
      <div class="container mt-4">
        <div class="row justify-content-center">
          <div class="col-lg-8">
            <div class="card shadow">
              <div class="card-header" [ngClass]="isEditMode ? 'bg-warning text-dark' : 'bg-primary text-white'">
                <h4 class="mb-0">
                  <i class="bi bi-person me-2"></i>
                  {{ isEditMode ? 'Edit Member' : 'Add New Member' }}
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
                               formControlName="isActive" id="flexSwitchCheckChecked">
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
                            class="btn" 
                            [ngClass]="isEditMode ? 'btn-warning' : 'btn-primary'"
                            [disabled]="memberForm.invalid || isLoading">
                      <span *ngIf="isLoading" class="spinner-border spinner-border-sm me-2"></span>
                      <i class="bi" [class.bi-check-circle]="!isLoading" [class.bi-hourglass-split]="isLoading" me-1></i>
                      {{ isEditMode ? 'Update Member' : 'Add Member' }}
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
export class MemberFormComponent implements OnInit {
  memberForm: FormGroup;
  isEditMode = false;
  memberId: string | null = null;
  isLoading = false;
  membershipTypes = MEMBERSHIP_TYPES;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private memberService: MemberService,
    private authService: AuthService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {
    console.log('MemberFormComponent constructor');
    
    // Initialize form - flattened address structure
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

  ngOnInit() {
    console.log('MemberFormComponent ngOnInit');
    
    this.memberId = this.route.snapshot.paramMap.get('id');
    console.log('Member ID from route:', this.memberId);
    
    // Check if we're in edit mode or add mode
    if (this.memberId && this.memberId !== 'new') {
      this.isEditMode = true;
      console.log('Edit mode: Loading member data');
      this.loadMember(this.memberId);
    } else {
      this.isEditMode = false;
      console.log('Add mode: Creating new member');
      this.forceUpdate();
    }
  }

  loadMember(id: string) {
    this.isLoading = true;
    console.log('Loading member data for ID:', id);
    
    this.memberService.getMemberById(id).subscribe({
      next: (member) => {
        console.log('Member loaded:', member);
        
        this.ngZone.run(() => {
          // Populate form with member data
          this.memberForm.patchValue({
            firstName: member.firstName || '',
            lastName: member.lastName || '',
            email: member.email || '',
            phone: member.phone || '',
            street: member.address?.street || '',
            city: member.address?.city || '',
            state: member.address?.state || '',
            zipCode: member.address?.zipCode || '',
            membershipType: member.membershipType || 'Regular',
            isActive: member.isActive !== undefined ? member.isActive : true
          });
          
          this.isLoading = false;
          this.forceUpdate();
          console.log('Form populated with member data');
        });
      },
      error: (error) => {
        console.error('Error loading member:', error);
        this.toastr.error('Failed to load member details');
        this.isLoading = false;
        this.forceUpdate();
        this.goBack();
      }
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
    
    // Prepare member data with address object
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

    if (this.isEditMode && this.memberId) {
      // Update existing member
      this.memberService.updateMember(this.memberId, memberData).subscribe({
        next: () => {
          console.log('Member updated successfully');
          this.toastr.success('Member updated successfully');
          this.isLoading = false;
          this.goBack();
        },
        error: (error) => {
          console.error('Error updating member:', error);
          this.isLoading = false;
          this.toastr.error(error.message || 'Failed to update member');
          this.forceUpdate();
        }
      });
    } else {
      // Create new member
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
          this.forceUpdate();
        }
      });
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.memberForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  goBack() {
    this.router.navigate(['/members']);
  }

  private forceUpdate() {
    this.ngZone.run(() => {
      this.cdr.markForCheck();
      this.cdr.detectChanges();
    });
  }
}