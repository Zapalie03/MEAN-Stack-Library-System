import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MemberService } from '../services/member.service';
import { AuthService } from '../services/auth.service';
import { NavbarComponent } from './navbar.component';

@Component({
  selector: 'app-member-details',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent],
  template: `
    <div class="container-fluid p-0">
      <app-navbar></app-navbar>
      
      <div class="container mt-4">
        <div class="row justify-content-center">
          <div class="col-lg-8">
            <div class="card shadow">
              <div class="card-header bg-primary text-white">
                <div class="d-flex justify-content-between align-items-center">
                  <h4 class="mb-0">
                    <i class="bi bi-person me-2"></i>
                    Member Details
                  </h4>
                  <button class="btn btn-outline-light btn-sm" (click)="goBack()">
                    <i class="bi bi-arrow-left me-1"></i>Back to Members
                  </button>
                </div>
              </div>
              
              <div class="card-body">
                <!-- Loading State -->
                <div *ngIf="isLoading" class="text-center py-5">
                  <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                  </div>
                  <p class="mt-2">Loading member details...</p>
                </div>
                
                <!-- Member Data -->
                <div *ngIf="!isLoading && member" class="row">
                  <div class="col-md-12">
                    <div class="row mb-4">
                      <div class="col-md-3">
                        <div class="text-center">
                          <div class="member-avatar bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" 
                               style="width: 80px; height: 80px; font-size: 2rem;">
                            {{ getInitials() }}
                          </div>
                          <div>
                            <span class="badge" [ngClass]="member.isActive ? 'bg-success' : 'bg-danger'">
                              {{ member.isActive ? 'Active' : 'Inactive' }}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div class="col-md-9">
                        <h3 class="mb-1">{{ member.firstName }} {{ member.lastName }}</h3>
                        <p class="text-muted mb-3">
                          <i class="bi bi-envelope me-1"></i>{{ member.email }}
                          <span class="ms-3"><i class="bi bi-telephone me-1"></i>{{ member.phone }}</span>
                        </p>
                        
                        <div class="row">
                          <div class="col-md-6">
                            <div class="mb-3">
                              <label class="form-label text-muted small mb-1">Membership Type</label>
                              <div>
                                <span class="badge" [ngClass]="getMembershipBadgeClass(member.membershipType)">
                                  {{ member.membershipType }}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div class="col-md-6">
                            <div class="mb-3">
                              <label class="form-label text-muted small mb-1">Member Since</label>
                              <div>{{ formatDate(member.membershipDate) }}</div>
                            </div>
                          </div>
                        </div>
                        
                        <!-- Address -->
                        <div class="mb-3" *ngIf="member.address && (member.address.street || member.address.city)">
                          <label class="form-label text-muted small mb-1">Address</label>
                          <div>
                            <div *ngIf="member.address.street">{{ member.address.street }}</div>
                            <div *ngIf="member.address.city || member.address.state || member.address.zipCode">
                              {{ member.address.city || '' }} 
                              {{ member.address.state || '' }} 
                              {{ member.address.zipCode || '' }}
                            </div>
                          </div>
                        </div>
                        
                        <!-- Created By -->
                        <div class="mb-3">
                          <label class="form-label text-muted small mb-1">Created By</label>
                          <div>{{ member.createdBy?.name || 'System' }}</div>
                        </div>
                        
                        <!-- Actions -->
                        <div class="mt-4 pt-3 border-top">
                          <button *ngIf="authService.isAdmin" 
                                  class="btn btn-warning me-2"
                                  [routerLink]="['/members', member._id, 'edit']">
                            <i class="bi bi-pencil me-1"></i>Edit Member
                          </button>
                          <button class="btn btn-outline-secondary" (click)="goBack()">
                            <i class="bi bi-arrow-left me-1"></i>Back to List
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Not Found State -->
                <div *ngIf="!isLoading && !member" class="text-center py-5">
                  <i class="bi bi-exclamation-triangle text-warning" style="font-size: 3rem;"></i>
                  <h5 class="mt-3">Member not found</h5>
                  <button class="btn btn-primary mt-2" (click)="goBack()">
                    <i class="bi bi-arrow-left me-1"></i>Back to Members
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .member-avatar {
      font-weight: bold;
      background-color: #4361ee;
    }
    .form-label {
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
  `]
})
export class MemberDetailsComponent implements OnInit {
  member: any;
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private memberService: MemberService,
    public authService: AuthService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {
    console.log('MemberDetailsComponent constructor');
  }

  ngOnInit() {
    console.log('MemberDetailsComponent ngOnInit');
    const memberId = this.route.snapshot.paramMap.get('id');
    console.log('Member ID from route:', memberId);
    
    // Check if it's a valid ID (not 'new')
    if (memberId && memberId !== 'new' && memberId !== 'add') {
      console.log('Valid member ID, loading...');
      this.loadMember(memberId);
    } else {
      console.error('Invalid member ID or trying to view "new" member');
      this.isLoading = false;
      this.forceUpdate();
    }
  }

  loadMember(id: string) {
    console.log('Loading member with ID:', id);
    
    this.memberService.getMemberById(id).subscribe({
      next: (member) => {
        console.log('Member loaded successfully');
        console.log('Member data:', member);
        
        this.ngZone.run(() => {
          this.member = member;
          this.isLoading = false;
          
          // Force update the view
          this.cdr.markForCheck();
          this.cdr.detectChanges();
          console.log('View updated after data load');
        });
      },
      error: (error) => {
        console.error('Error loading member:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        
        this.ngZone.run(() => {
          this.isLoading = false;
          this.member = null;
          
          // Force update the view
          this.cdr.markForCheck();
          this.cdr.detectChanges();
          console.log('View updated after error');
        });
      }
    });
  }

  goBack() {
    this.router.navigate(['/members']);
  }

  getInitials(): string {
    if (!this.member) return '?';
    return (this.member.firstName?.charAt(0) || '') + (this.member.lastName?.charAt(0) || '');
  }

  getMembershipBadgeClass(type: string): string {
    switch(type?.toLowerCase()) {
      case 'premium': return 'bg-warning text-dark';
      case 'student': return 'bg-info';
      default: return 'bg-secondary';
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  }

  private forceUpdate() {
    this.ngZone.run(() => {
      this.cdr.markForCheck();
      this.cdr.detectChanges();
    });
  }
}