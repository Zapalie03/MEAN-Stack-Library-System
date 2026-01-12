import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { MemberService } from '../services/member.service';
import { AuthService } from '../services/auth.service';
import { NavbarComponent } from './navbar.component';
import { Member, MEMBERSHIP_TYPES } from '../models/member.model';

@Component({
  selector: 'app-members-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NavbarComponent],
  template: `
    <div class="container-fluid p-0">
      <app-navbar></app-navbar>
      
      <div class="container mt-4">
        <!-- Header with Actions -->
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h2><i class="bi bi-people me-2"></i>Member Management</h2>
          <div>
            <button *ngIf="authService.isAdmin" 
                    class="btn btn-primary me-2"
                    routerLink="/members/add">
              <i class="bi bi-person-plus me-1"></i>Add Member
            </button>
            <button class="btn btn-outline-secondary" (click)="loadMembers()">
              <i class="bi bi-arrow-clockwise"></i>
            </button>
          </div>
        </div>

        <!-- Search and Filter -->
        <div class="card shadow mb-4">
          <div class="card-body">
            <div class="row">
              <div class="col-md-6 mb-3">
                <div class="input-group">
                  <span class="input-group-text">
                    <i class="bi bi-search"></i>
                  </span>
                  <input type="text" 
                         class="form-control" 
                         placeholder="Search members by name or email"
                         [(ngModel)]="searchQuery"
                         (keyup.enter)="loadMembers()">
                  <button class="btn btn-primary" (click)="loadMembers()">Search</button>
                </div>
              </div>
              <div class="col-md-3 mb-3">
                <select class="form-select" [(ngModel)]="selectedStatus" (change)="loadMembers()">
                  <option value="">All Status</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
              <div class="col-md-3 mb-3">
                <select class="form-select" [(ngModel)]="itemsPerPage" (change)="loadMembers()">
                  <option value="5">5 per page</option>
                  <option value="10">10 per page</option>
                  <option value="20">20 per page</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div *ngIf="isLoading" class="text-center my-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-2">Loading members...</p>
        </div>

        <!-- Members Table -->
        <div *ngIf="!isLoading" class="card shadow">
          <div class="card-body">
            <div class="table-responsive">
              <table class="table table-hover">
                <thead class="table-light">
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Membership</th>
                    <th>Status</th>
                    <th>Borrowed</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let member of members">
                    <td>
                      <strong>{{ member.firstName }} {{ member.lastName }}</strong>
                      <small class="d-block text-muted">
                        Joined: {{ formatDate(member.membershipDate) }}
                      </small>
                    </td>
                    <td>{{ member.email }}</td>
                    <td>{{ member.phone }}</td>
                    <td>
                      <span class="badge" [ngClass]="{
                        'bg-secondary': member.membershipType === 'Regular',
                        'bg-warning': member.membershipType === 'Premium',
                        'bg-info': member.membershipType === 'Student'
                      }">
                        {{ member.membershipType }}
                      </span>
                    </td>
                    <td>
                      <span class="badge" [ngClass]="member.isActive ? 'bg-success' : 'bg-danger'">
                        {{ member.isActive ? 'Active' : 'Inactive' }}
                      </span>
                    </td>
                    <td>
                      {{ getBorrowedBooksCount(member) }} books
                    </td>
                    <td>
                      <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-info" 
                                [routerLink]="['/members', member._id]">
                          <i class="bi bi-eye"></i>
                        </button>
                        <button *ngIf="authService.isAdmin" 
                                class="btn btn-outline-warning"
                                [routerLink]="['/members/edit', member._id]">
                          <i class="bi bi-pencil"></i>
                        </button>
                        <button *ngIf="authService.isAdmin" 
                                class="btn btn-outline-danger"
                                (click)="deleteMember(member._id, member.firstName + ' ' + member.lastName)">
                          <i class="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Empty State -->
            <div *ngIf="members.length === 0" class="text-center py-5">
              <i class="bi bi-people text-muted" style="font-size: 3rem;"></i>
              <h5 class="mt-3">No members found</h5>
              <p class="text-muted">
                {{ searchQuery ? 'Try a different search term' : 'Add your first member to get started' }}
              </p>
              <button *ngIf="authService.isAdmin" 
                      class="btn btn-primary"
                      routerLink="/members/add">
                <i class="bi bi-plus-circle me-1"></i>Add First Member
              </button>
            </div>

            <!-- Pagination -->
            <div *ngIf="members.length > 0" class="d-flex justify-content-between align-items-center mt-4">
              <div>
                Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to 
                {{ Math.min(currentPage * itemsPerPage, totalItems) }} of {{ totalItems }} members
              </div>
              <nav>
                <ul class="pagination mb-0">
                  <li class="page-item" [class.disabled]="currentPage === 1">
                    <button class="page-link" (click)="changePage(currentPage - 1)">
                      Previous
                    </button>
                  </li>
                  <li class="page-item" *ngFor="let page of getPages()" 
                      [class.active]="page === currentPage">
                    <button class="page-link" (click)="changePage(page)">{{ page }}</button>
                  </li>
                  <li class="page-item" [class.disabled]="currentPage === totalPages">
                    <button class="page-link" (click)="changePage(currentPage + 1)">
                      Next
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .table th {
      font-weight: 600;
      text-transform: uppercase;
      font-size: 0.85rem;
      letter-spacing: 0.5px;
    }
    
    .table td {
      vertical-align: middle;
    }
    
    .badge {
      font-size: 0.75rem;
      padding: 4px 8px;
    }
    
    .btn-group-sm .btn {
      padding: 0.25rem 0.5rem;
    }
    
    .pagination .page-item.active .page-link {
      background-color: #4361ee;
      border-color: #4361ee;
    }
  `]
})
export class MembersListComponent implements OnInit {
  members: Member[] = [];
  isLoading = true;
  searchQuery = '';
  selectedStatus = '';
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  totalPages = 0;
  membershipTypes = MEMBERSHIP_TYPES;

  constructor(
    public authService: AuthService,
    private memberService: MemberService,
    private router: Router,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef, // Added ChangeDetectorRef
    private ngZone: NgZone // Added NgZone
  ) {
    console.log('MembersListComponent initialized');
  }

  ngOnInit() {
    console.log('MembersListComponent ngOnInit');
    console.log('Current User:', this.authService.currentUserValue);
    console.log('Is Admin?', this.authService.isAdmin);
    this.loadMembers();
  }

  loadMembers() {
    console.log('Loading members...');
    console.log('Search query:', this.searchQuery);
    console.log('Status filter:', this.selectedStatus);
    
    this.isLoading = true;
    const isActive = this.selectedStatus === '' ? undefined : this.selectedStatus === 'true';
    
    this.memberService.getMembers(
      this.currentPage,
      this.itemsPerPage,
      this.searchQuery,
      isActive
    ).subscribe({
      next: (response) => {
        console.log('Members loaded:', response.members?.length || 0);
        console.log('Total items:', response.pagination?.total);
        
        // Run inside Angular zone to trigger change detection
        this.ngZone.run(() => {
          this.members = response.members || [];
          this.totalItems = response.pagination?.total || 0;
          this.totalPages = response.pagination?.pages || 0;
          this.isLoading = false;
          
          // Force change detection
          this.cdr.markForCheck();
          this.cdr.detectChanges();
          console.log('View updated after loading members');
        });
      },
      error: (error) => {
        console.error('Error loading members:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        
        // Run inside Angular zone
        this.ngZone.run(() => {
          this.isLoading = false;
          this.members = [];
          this.totalItems = 0;
          this.totalPages = 0;
          
          // Force change detection
          this.cdr.markForCheck();
          this.cdr.detectChanges();
          this.toastr.error('Failed to load members');
          console.log('View updated after error');
        });
      }
    });
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadMembers();
    }
  }

  getPages(): number[] {
    const pages = [];
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.totalPages, this.currentPage + 2);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  deleteMember(id: string, name: string) {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      this.memberService.deleteMember(id).subscribe({
        next: () => {
          this.toastr.success('Member deleted successfully');
          this.loadMembers();
        },
        error: (error) => {
          this.toastr.error(error.message || 'Failed to delete member');
        }
      });
    }
  }

  getBorrowedBooksCount(member: Member): number {
    if (!member.booksBorrowed) return 0;
    return member.booksBorrowed.filter(book => !book.returned).length;
  }

  formatDate(date: any): string {
    if (!date) return '';
    try {
      const d = new Date(date);
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  }

  // Helper for Math.min in template
  Math = Math;
}