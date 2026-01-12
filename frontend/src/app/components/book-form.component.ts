import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BookService } from '../services/book.service';
import { AuthService } from '../services/auth.service';
import { NavbarComponent } from './navbar.component';
import { BookRequest, GENRES } from '../models/book.model';

@Component({
  selector: 'app-book-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, NavbarComponent],
  template: `
    <div class="container-fluid p-0">
      <app-navbar></app-navbar>
      
      <div class="container mt-4">
        <div class="row justify-content-center">
          <div class="col-lg-8">
            <div class="card shadow">
              <div class="card-header bg-primary text-white">
                <h4 class="mb-0">
                  <i class="bi bi-book me-2"></i>
                  {{ isEditMode ? 'Edit Book' : 'Add New Book' }}
                </h4>
              </div>
              
              <div class="card-body">
                <form [formGroup]="bookForm" (ngSubmit)="onSubmit()">
                  <!-- Title -->
                  <div class="mb-3">
                    <label class="form-label">Title *</label>
                    <input type="text" 
                           class="form-control" 
                           formControlName="title"
                           [class.is-invalid]="isFieldInvalid('title')"
                           placeholder="Enter book title">
                    <div class="invalid-feedback" *ngIf="isFieldInvalid('title')">
                      Title is required
                    </div>
                  </div>

                  <!-- Author -->
                  <div class="mb-3">
                    <label class="form-label">Author *</label>
                    <input type="text" 
                           class="form-control" 
                           formControlName="author"
                           [class.is-invalid]="isFieldInvalid('author')"
                           placeholder="Enter author name">
                    <div class="invalid-feedback" *ngIf="isFieldInvalid('author')">
                      Author is required
                    </div>
                  </div>

                  <div class="row">
                    <!-- ISBN -->
                    <div class="col-md-6 mb-3">
                      <label class="form-label">ISBN *</label>
                      <input type="text" 
                             class="form-control" 
                             formControlName="isbn"
                             [class.is-invalid]="isFieldInvalid('isbn')"
                             placeholder="Enter ISBN">
                      <div class="invalid-feedback" *ngIf="isFieldInvalid('isbn')">
                        ISBN is required
                      </div>
                    </div>

                    <!-- Published Year -->
                    <div class="col-md-6 mb-3">
                      <label class="form-label">Published Year *</label>
                      <input type="number" 
                             class="form-control" 
                             formControlName="publishedYear"
                             [class.is-invalid]="isFieldInvalid('publishedYear')"
                             min="1000"
                             [max]="currentYear"
                             placeholder="e.g., 2023">
                      <div class="invalid-feedback" *ngIf="isFieldInvalid('publishedYear')">
                        Please enter a valid year (1000-{{ currentYear }})
                      </div>
                    </div>
                  </div>

                  <div class="row">
                    <!-- Genre -->
                    <div class="col-md-6 mb-3">
                      <label class="form-label">Genre *</label>
                      <select class="form-select" 
                              formControlName="genre"
                              [class.is-invalid]="isFieldInvalid('genre')">
                        <option value="">Select Genre</option>
                        <option *ngFor="let genre of genres" [value]="genre">{{ genre }}</option>
                      </select>
                      <div class="invalid-feedback" *ngIf="isFieldInvalid('genre')">
                        Please select a genre
                      </div>
                    </div>

                    <!-- Total Copies -->
                    <div class="col-md-3 mb-3">
                      <label class="form-label">Total Copies *</label>
                      <input type="number" 
                             class="form-control" 
                             formControlName="totalCopies"
                             [class.is-invalid]="isFieldInvalid('totalCopies')"
                             min="1"
                             placeholder="Total">
                      <div class="invalid-feedback" *ngIf="isFieldInvalid('totalCopies')">
                        Must have at least 1 copy
                      </div>
                    </div>

                    <!-- Available Copies -->
                    <div class="col-md-3 mb-3">
                      <label class="form-label">Available Copies *</label>
                      <input type="number" 
                             class="form-control" 
                             formControlName="copiesAvailable"
                             [class.is-invalid]="isFieldInvalid('copiesAvailable')"
                             min="0"
                             [max]="bookForm.get('totalCopies')?.value"
                             placeholder="Available">
                      <div class="invalid-feedback" *ngIf="isFieldInvalid('copiesAvailable')">
                        Cannot exceed total copies or be negative
                      </div>
                    </div>
                  </div>

                  <!-- Description -->
                  <div class="mb-4">
                    <label class="form-label">Description</label>
                    <textarea class="form-control" 
                              formControlName="description"
                              rows="4"
                              placeholder="Enter book description (optional)"></textarea>
                  </div>

                  <!-- Form Actions -->
                  <div class="d-flex justify-content-between">
                    <button type="button" 
                            class="btn btn-outline-secondary"
                            routerLink="/books">
                      <i class="bi bi-arrow-left me-1"></i>Cancel
                    </button>
                    <button type="submit" 
                            class="btn btn-primary"
                            [disabled]="bookForm.invalid || isLoading">
                      <span *ngIf="isLoading" class="spinner-border spinner-border-sm me-2"></span>
                      <i class="bi" [class.bi-check-circle]="!isLoading" [class.bi-hourglass-split]="isLoading" me-1></i>
                      {{ isEditMode ? 'Update Book' : 'Add Book' }}
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
export class BookFormComponent implements OnInit {
  bookForm: FormGroup;
  isEditMode = false;
  bookId: string | null = null;
  isLoading = false;
  genres = GENRES;
  currentYear: number;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private bookService: BookService,
    private authService: AuthService,
    private toastr: ToastrService
  ) {
    this.currentYear = new Date().getFullYear();
    
    // ADD THESE DEBUG LOGS AT THE BEGINNING
    console.log('🔧 BookFormComponent constructor called');
    console.log('👤 Current User:', this.authService.currentUserValue);
    console.log('👑 Is Admin?', this.authService.isAdmin);
    console.log('🔑 Is Logged In?', this.authService.isLoggedIn());
    console.log('📍 Current Path (from router):', this.router.url);
    
    this.bookForm = this.fb.group({
      title: ['', Validators.required],
      author: ['', Validators.required],
      isbn: ['', Validators.required],
      publishedYear: ['', [
        Validators.required,
        Validators.min(1000),
        Validators.max(this.currentYear)
      ]],
      genre: ['', Validators.required],
      totalCopies: [1, [
        Validators.required,
        Validators.min(1)
      ]],
      copiesAvailable: [1, [
        Validators.required,
        Validators.min(0)
      ]],
      description: ['']
    });

    // Update available copies validation when total copies changes
    this.bookForm.get('totalCopies')?.valueChanges.subscribe(total => {
      const availableControl = this.bookForm.get('copiesAvailable');
      if (availableControl && availableControl.value > total) {
        availableControl.setValue(total);
      }
    });
  }

 ngOnInit() {
  console.log('BookFormComponent ngOnInit');
  console.log('Route snapshot path:', this.route.snapshot.routeConfig?.path);
  console.log('Full route snapshot:', this.route.snapshot);
  
  this.bookId = this.route.snapshot.paramMap.get('id');
  console.log('Book ID from route:', this.bookId);
  
  if (this.bookId) {
    this.isEditMode = true;
    console.log('Edit mode activated');
    this.loadBook();
  } else {
    console.log('Add new book mode');
  }
  
  // Double-check authentication and admin status
  setTimeout(() => {
    console.log('Post-init auth check:');
    console.log('User:', this.authService.currentUserValue);
    console.log('Is Admin?', this.authService.isAdmin);
    console.log('Token exists?', !!this.authService.token);
  }, 100);
}

  loadBook() {
    this.isLoading = true;
    this.bookService.getBookById(this.bookId!).subscribe({
      next: (book) => {
        this.bookForm.patchValue({
          title: book.title,
          author: book.author,
          isbn: book.isbn,
          publishedYear: book.publishedYear,
          genre: book.genre,
          totalCopies: book.totalCopies,
          copiesAvailable: book.copiesAvailable,
          description: book.description || ''
        });
        this.isLoading = false;
      },
      error: (error) => {
        this.toastr.error('Failed to load book');
        console.error(error);
        this.router.navigate(['/books']);
      }
    });
  }

  onSubmit() {
    if (this.bookForm.invalid) {
      this.bookForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const bookData: BookRequest = this.bookForm.value;

    if (this.isEditMode && this.bookId) {
      this.bookService.updateBook(this.bookId, bookData).subscribe({
        next: () => {
          this.toastr.success('Book updated successfully');
          this.router.navigate(['/books']);
        },
        error: (error) => {
          this.isLoading = false;
          this.toastr.error(error.message || 'Failed to update book');
        }
      });
    } else {
      this.bookService.createBook(bookData).subscribe({
        next: () => {
          this.toastr.success('Book added successfully');
          this.router.navigate(['/books']);
        },
        error: (error) => {
          this.isLoading = false;
          this.toastr.error(error.message || 'Failed to add book');
        }
      });
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.bookForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }
}