import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // Add ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BookService } from '../services/book.service';
import { AuthService } from '../services/auth.service';
import { NavbarComponent } from './navbar.component';

@Component({
  selector: 'app-book-details',
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
                    <i class="bi bi-book me-2"></i>
                    Book Details
                  </h4>
                  <button class="btn btn-outline-light btn-sm" routerLink="/books">
                    <i class="bi bi-arrow-left me-1"></i>Back to Books
                  </button>
                </div>
              </div>
              
              <div class="card-body">
                <div *ngIf="isLoading" class="text-center py-5">
                  <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                  </div>
                  <p class="mt-2">Loading book details...</p>
                </div>
                
                <div *ngIf="!isLoading && book" class="row">
                  <div class="col-md-8">
                    <h3>{{ book.title }}</h3>
                    <p class="text-muted">by {{ book.author }}</p>
                    <p class="mb-4">{{ book.description || 'No description available.' }}</p>
                    
                    <div class="row">
                      <div class="col-md-6">
                        <p><strong>ISBN:</strong> <code>{{ book.isbn }}</code></p>
                        <p><strong>Published Year:</strong> {{ book.publishedYear }}</p>
                        <p><strong>Genre:</strong> <span class="badge bg-info">{{ book.genre }}</span></p>
                      </div>
                      <div class="col-md-6">
                        <p><strong>Total Copies:</strong> {{ book.totalCopies }}</p>
                        <p><strong>Available Copies:</strong> 
                          <span [class]="book.copiesAvailable > 0 ? 'text-success' : 'text-danger'">
                            {{ book.copiesAvailable }}
                          </span>
                        </p>
                        <p><strong>Added By:</strong> {{ book.addedBy?.name || 'Unknown' }}</p>
                      </div>
                    </div>
                    
                    <div class="mt-4">
                      <button *ngIf="authService.isAdmin" 
                              class="btn btn-warning me-2"
                              [routerLink]="['/books', book._id, 'edit']">
                        <i class="bi bi-pencil me-1"></i>Edit Book
                      </button>
                      <button class="btn btn-outline-secondary" routerLink="/books">
                        <i class="bi bi-arrow-left me-1"></i>Back to List
                      </button>
                    </div>
                  </div>
                </div>
                
                <div *ngIf="!isLoading && !book" class="text-center py-5">
                  <i class="bi bi-exclamation-triangle text-warning" style="font-size: 3rem;"></i>
                  <h5 class="mt-3">Book not found</h5>
                  <button class="btn btn-primary mt-2" routerLink="/books">
                    <i class="bi bi-arrow-left me-1"></i>Back to Books
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class BookDetailsComponent implements OnInit {
  book: any;
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private bookService: BookService,
    public authService: AuthService,
    private cdr: ChangeDetectorRef // Add ChangeDetectorRef
  ) {}

  ngOnInit() {
    const bookId = this.route.snapshot.paramMap.get('id');
    console.log('BookDetailsComponent initialized');
    console.log('Book ID from route:', bookId);
    console.log('Current User:', this.authService.currentUserValue);
    
    if (bookId) {
      this.loadBook(bookId);
    } else {
      console.error('No book ID provided in route');
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  loadBook(id: string) {
    console.log('Loading book with ID:', id);
    this.bookService.getBookById(id).subscribe({
      next: (book) => {
        console.log('Book loaded successfully:', book);
        this.book = book;
        this.isLoading = false;
        this.cdr.detectChanges(); // Force change detection
      },
      error: (error) => {
        console.error('Error loading book:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }
}