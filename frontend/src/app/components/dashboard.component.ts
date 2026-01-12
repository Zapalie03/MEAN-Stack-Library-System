import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { BookService } from '../services/book.service';
import { MemberService } from '../services/member.service';
import { NavbarComponent } from './navbar.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent],
  template: `
    <div class="container-fluid p-0">
      <app-navbar></app-navbar>
      
      <div class="container mt-4">
        <!-- Welcome Card -->
        <div class="card shadow mb-4">
          <div class="card-body">
            <div class="row align-items-center">
              <div class="col-md-8">
                <h3 class="mb-2">
                  <i class="bi bi-speedometer2 text-primary me-2"></i>
                  Welcome back, {{ currentUser?.name }}!
                </h3>
                <p class="text-muted mb-0">
                  <i class="bi bi-envelope me-1"></i> {{ currentUser?.email }} 
                  <span class="badge bg-primary ms-2">{{ currentUser?.role }}</span>
                </p>
              </div>
              <div class="col-md-4 text-end">
                <button (click)="refreshData()" class="btn btn-outline-primary" [disabled]="isLoading">
                  <i class="bi bi-arrow-clockwise" [class.spin]="isLoading"></i>
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Stats Cards -->
        <div class="row mb-4">
          <div class="col-md-3 mb-3">
            <div class="card text-white bg-primary shadow">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <h3 class="mb-0">{{ stats.totalBooks || 0 }}</h3>
                    <p class="mb-0 opacity-75">Total Books</p>
                  </div>
                  <i class="bi bi-book fs-1 opacity-75"></i>
                </div>
              </div>
            </div>
          </div>
          
          <div class="col-md-3 mb-3">
            <div class="card text-white bg-success shadow">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <h3 class="mb-0">{{ stats.totalMembers || 0 }}</h3>
                    <p class="mb-0 opacity-75">Total Members</p>
                  </div>
                  <i class="bi bi-people fs-1 opacity-75"></i>
                </div>
              </div>
            </div>
          </div>
          
          <div class="col-md-3 mb-3">
            <div class="card text-white bg-warning shadow">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <h3 class="mb-0">{{ stats.availableBooks || 0 }}</h3>
                    <p class="mb-0 opacity-75">Available Books</p>
                  </div>
                  <i class="bi bi-bookmark-check fs-1 opacity-75"></i>
                </div>
              </div>
            </div>
          </div>
          
          <div class="col-md-3 mb-3">
            <div class="card text-white bg-info shadow">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <h3 class="mb-0">{{ stats.activeMembers || 0 }}</h3>
                    <p class="mb-0 opacity-75">Active Members</p>
                  </div>
                  <i class="bi bi-person-check fs-1 opacity-75"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="card shadow mb-4">
          <div class="card-header bg-white">
            <h5 class="mb-0">
              <i class="bi bi-lightning me-2"></i>
              Quick Actions
            </h5>
          </div>
          <div class="card-body">
            <div class="row g-3">
              <div class="col-md-3">
                <button routerLink="/books" class="btn btn-primary w-100">
                  <i class="bi bi-book me-2"></i>Manage Books
                </button>
              </div>
              <div class="col-md-3">
                <button *ngIf="isAdmin" routerLink="/books/new" class="btn btn-success w-100">
                  <i class="bi bi-plus-circle me-2"></i>Add New Book
                </button>
              </div>
              <div class="col-md-3">
                <button routerLink="/members" class="btn btn-warning w-100">
                  <i class="bi bi-people me-2"></i>Manage Members
                </button>
              </div>
              <div class="col-md-3">
                <button *ngIf="isAdmin" routerLink="/members/new" class="btn btn-info w-100">
                  <i class="bi bi-person-plus me-2"></i>Add New Member
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="row">
          <div class="col-md-6 mb-4">
            <div class="card shadow h-100">
              <div class="card-header bg-white d-flex justify-content-between align-items-center">
                <h5 class="mb-0">
                  <i class="bi bi-clock-history me-2"></i>
                  Recent Books
                </h5>
                <button routerLink="/books" class="btn btn-sm btn-outline-primary">
                  View All
                </button>
              </div>
              <div class="card-body">
                <div *ngIf="recentBooks.length === 0" class="text-center py-5">
                  <i class="bi bi-book text-muted fs-1 mb-3"></i>
                  <p class="text-muted">No books added yet</p>
                  <button *ngIf="isAdmin" routerLink="/books/new" class="btn btn-primary btn-sm">
                    Add First Book
                  </button>
                </div>
                <div *ngFor="let book of recentBooks" class="border-bottom pb-3 mb-3">
                  <h6 class="mb-1">
                    <i class="bi bi-book text-primary me-2"></i>
                    {{ book.title }}
                  </h6>
                  <p class="text-muted mb-1 small">
                    <i class="bi bi-person me-1"></i> {{ book.author }} • 
                    <span class="badge bg-secondary">{{ book.genre }}</span>
                  </p>
                  <div class="d-flex justify-content-between align-items-center">
                    <small class="text-muted">ISBN: {{ book.isbn }}</small>
                    <span class="badge" [ngClass]="book.copiesAvailable > 0 ? 'bg-success' : 'bg-danger'">
                      {{ book.copiesAvailable }} available
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="col-md-6 mb-4">
            <div class="card shadow h-100">
              <div class="card-header bg-white d-flex justify-content-between align-items-center">
                <h5 class="mb-0">
                  <i class="bi bi-activity me-2"></i>
                  Recent Members
                </h5>
                <button routerLink="/members" class="btn btn-sm btn-outline-primary">
                  View All
                </button>
              </div>
              <div class="card-body">
                <div *ngIf="recentMembers.length === 0" class="text-center py-5">
                  <i class="bi bi-person text-muted fs-1 mb-3"></i>
                  <p class="text-muted">No members registered yet</p>
                  <button *ngIf="isAdmin" routerLink="/members/new" class="btn btn-primary btn-sm">
                    Add First Member
                  </button>
                </div>
                <div *ngFor="let member of recentMembers" class="border-bottom pb-3 mb-3">
                  <h6 class="mb-1">
                    <i class="bi bi-person text-success me-2"></i>
                    {{ member.firstName }} {{ member.lastName }}
                  </h6>
                  <p class="text-muted mb-1 small">
                    <i class="bi bi-envelope me-1"></i> {{ member.email }} • 
                    <span class="badge" [ngClass]="getMembershipBadgeClass(member.membershipType)">
                      {{ member.membershipType }}
                    </span>
                  </p>
                  <div class="d-flex justify-content-between align-items-center">
                    <small class="text-muted">Joined: {{ formatDate(member.createdAt) }}</small>
                    <span class="badge" [ngClass]="member.isActive ? 'bg-success' : 'bg-danger'">
                      {{ member.isActive ? 'Active' : 'Inactive' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card {
      border: none;
      border-radius: 10px;
    }
    .card-header {
      border-radius: 10px 10px 0 0 !important;
    }
    .badge {
      font-weight: 500;
    }
    i.spin {
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `]
})
export class DashboardComponent implements OnInit {
  currentUser: any;
  isAdmin = false;
  stats: any = {
    totalBooks: 0,
    totalMembers: 0,
    availableBooks: 0,
    activeMembers: 0
  };
  recentBooks: any[] = [];
  recentMembers: any[] = [];
  isLoading = false;

  constructor(
    private authService: AuthService,
    private bookService: BookService,
    private memberService: MemberService,
    private cdr: ChangeDetectorRef
  ) {
    this.currentUser = this.authService.currentUserValue;
    this.isAdmin = this.authService.isAdmin;
  }

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.isLoading = true;
    
    this.bookService.getBooks(1, 100).subscribe({
      next: (response) => {
        this.stats.totalBooks = response.pagination?.total || 0;
        
        // Calculate available books
        let available = 0;
        response.books?.forEach((book: any) => {
          available += book.copiesAvailable || 0;
        });
        this.stats.availableBooks = available;
        
        // Get recent books (first 5)
        this.recentBooks = response.books?.slice(0, 5) || [];
        
        // Load members data after books are loaded
        this.loadMembersData();
        
        // Force change detection
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading books:', error);
        this.isLoading = false;
      }
    });
  }

  loadMembersData() {
    this.memberService.getMembers(1, 100).subscribe({
      next: (response) => {
        this.stats.totalMembers = response.pagination?.total || 0;
        
        // Calculate active members
        let active = 0;
        response.members?.forEach((member: any) => {
          if (member.isActive) active++;
        });
        this.stats.activeMembers = active;
        
        // Get recent members (first 5)
        this.recentMembers = response.members?.slice(0, 5) || [];
        
        this.isLoading = false;
        
        // Force change detection
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading members:', error);
        this.isLoading = false;
      }
    });
  }

  refreshData() {
    this.loadDashboardData();
  }

  getMembershipBadgeClass(type: string): string {
    switch(type) {
      case 'Premium': return 'bg-warning text-dark';
      case 'Student': return 'bg-info';
      default: return 'bg-secondary';
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}