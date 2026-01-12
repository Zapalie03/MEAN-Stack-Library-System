import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Book, BookRequest, PaginatedBooks } from '../models/book.model';

@Injectable({
  providedIn: 'root'
})
export class BookService {
  private apiUrl = `${environment.apiUrl}/books`;

  constructor(private http: HttpClient) { }

  // Get all books with pagination and search
  getBooks(
    page: number = 1,
    limit: number = 10,
    search: string = '',
    genre: string = ''
  ): Observable<PaginatedBooks> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search) params = params.set('search', search);
    if (genre) params = params.set('genre', genre);

    return this.http.get<PaginatedBooks>(this.apiUrl, { params })
      .pipe(catchError(this.handleError));
  }

  // Get single book by ID
  getBookById(id: string): Observable<Book> {
    return this.http.get<Book>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  // Create new book
  createBook(bookData: BookRequest): Observable<any> {
    return this.http.post(this.apiUrl, bookData)
      .pipe(catchError(this.handleError));
  }

  // Update book
  updateBook(id: string, bookData: BookRequest): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, bookData)
      .pipe(catchError(this.handleError));
  }

  // Delete book
  deleteBook(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  // Search books
  searchBooks(query: string): Observable<Book[]> {
    const params = new HttpParams().set('search', query);
    return this.http.get<Book[]>(this.apiUrl, { params })
      .pipe(catchError(this.handleError));
  }

  // Error handler
  private handleError(error: any): Observable<never> {
    console.error('Book Service Error:', error);
    let errorMessage = 'An error occurred';
    
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.status === 401) {
      errorMessage = 'Unauthorized access';
    } else if (error.status === 403) {
      errorMessage = 'You do not have permission to perform this action';
    }
    
    return throwError(() => new Error(errorMessage));
  }
}