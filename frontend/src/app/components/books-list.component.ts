import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // Add ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BookService } from '../services/book.service';
import { AuthService } from '../services/auth.service';
import { NavbarComponent } from './navbar.component';
import { Book, GENRES } from '../models/book.model';

@Component({
  selector: 'app-books-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NavbarComponent],
  template: `
    <div class="container-fluid p-0">
      <app-navbar></app-navbar>
      
      <div class="container mt-4">
        <!-- Header with Actions -->
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h2><i class="bi bi-book me-2"></i>Book Management</h2>
          <div>
            <button *ngIf="authService.isAdmin" 
                    class="btn btn-primary me-2"
                    routerLink="/books/new">
              <i class="bi bi-plus-circle me-1"></i>Add Book
            </button>
            <button class="btn btn-outline-secondary" (click)="loadBooks()">
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
                         placeholder="Search books by title, author, or ISBN"
                         [(ngModel)]="searchQuery"
                         (keyup.enter)="loadBooks()">
                  <button class="btn btn-primary" (click)="loadBooks()">Search</button>
                </div>
              </div>
              <div class="col-md-3 mb-3">
                <select class="form-select" [(ngModel)]="selectedGenre" (change)="loadBooks()">
                  <option value="">All Genres</option>
                  <option *ngFor="let genre of genres" [value]="genre">{{ genre }}</option>
                </select>
              </div>
              <div class="col-md-3 mb-3">
                <select class="form-select" [(ngModel)]="itemsPerPage" (change)="loadBooks()">
                  <option value="5">5 per page</option>
                  <option value="10">10 per page</option>
                  <option value="20">20 per page</option>
                  <option value="50">50 per page</option>
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
          <p class="mt-2">Loading books...</p>
        </div>

        <!-- Books Table -->
        <div *ngIf="!isLoading" class="card shadow">
          <div class="card-body">
            <div class="table-responsive">
              <table class="table table-hover">
                <thead class="table-light">
                  <tr>
                    <th>Title</th>
                    <th>Author</th>
                    <th>ISBN</th>
                    <th>Genre</th>
                    <th>Year</th>
                    <th>Copies</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let book of books">
                    <td>
                      <strong>{{ book.title }}</strong>
                      <small *ngIf="book.description" class="d-block text-muted">
                        {{ book.description | slice:0:50 }}...
                      </small>
                    </td>
                    <td>{{ book.author }}</td>
                    <td><code>{{ book.isbn }}</code></td>
                    <td>
                      <span class="badge bg-info">{{ book.genre }}</span>
                    </td>
                    <td>{{ book.publishedYear }}</td>
                    <td>
                      <span [class]="book.copiesAvailable > 0 ? 'text-success' : 'text-danger'">
                        {{ book.copiesAvailable }} / {{ book.totalCopies }}
                      </span>
                    </td>
                    <td>
                      <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-info" 
                                [routerLink]="['/books', book._id]">
                          <i class="bi bi-eye"></i>
                        </button>
                        <button *ngIf="authService.isAdmin" 
                                class="btn btn-outline-warning"
                                [routerLink]="['/books', book._id, 'edit']">
                          <i class="bi bi-pencil"></i>
                        </button>
                        <button *ngIf="authService.isAdmin" 
                                class="btn btn-outline-danger"
                                (click)="deleteBook(book._id, book.title)">
                          <i class="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Empty State -->
            <div *ngIf="books.length === 0" class="text-center py-5">
              <i class="bi bi-book text-muted" style="font-size: 3rem;"></i>
              <h5 class="mt-3">No books found</h5>
              <p class="text-muted">
                {{ searchQuery ? 'Try a different search term' : 'Add your first book to get started' }}
              </p>
              <button *ngIf="authService.isAdmin" 
                      class="btn btn-primary"
                      routerLink="/books/new">
                <i class="bi bi-plus-circle me-1"></i>Add First Book
              </button>
            </div>

            <!-- Pagination -->
            <div *ngIf="books.length > 0" class="d-flex justify-content-between align-items-center mt-4">
              <div>
                Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to 
                {{ Math.min(currentPage * itemsPerPage, totalItems) }} of {{ totalItems }} books
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
export class BooksListComponent implements OnInit {
  books: Book[] = [];
  isLoading = true;
  searchQuery = '';
  selectedGenre = '';
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  totalPages = 0;
  genres = GENRES;

  constructor(
    public authService: AuthService,
    private bookService: BookService,
    private router: Router,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef // Add ChangeDetectorRef
  ) {}

  ngOnInit() {
    console.log('BooksListComponent initialized');
    console.log('Current User:', this.authService.currentUserValue);
    console.log('Is Admin?', this.authService.isAdmin);
    this.loadBooks();
  }

  loadBooks() {
    this.isLoading = true;
    console.log('Loading books...');
    this.bookService.getBooks(
      this.currentPage,
      this.itemsPerPage,
      this.searchQuery,
      this.selectedGenre
    ).subscribe({
      next: (response) => {
        console.log('Books loaded:', response.books?.length || 0);
        this.books = response.books;
        this.totalItems = response.pagination.total;
        this.totalPages = response.pagination.pages;
        this.isLoading = false;
        
        // Force change detection
        this.cdr.detectChanges();
        console.log('Change detection triggered');
      },
      error: (error) => {
        console.error('Error loading books:', error);
        this.toastr.error('Failed to load books');
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadBooks();
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

  deleteBook(id: string, title: string) {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      this.bookService.deleteBook(id).subscribe({
        next: () => {
          this.toastr.success('Book deleted successfully');
          this.loadBooks();
        },
        error: (error) => {
          this.toastr.error(error.message || 'Failed to delete book');
        }
      });
    }
  }

  // Helper for Math.min in template
  Math = Math;
}