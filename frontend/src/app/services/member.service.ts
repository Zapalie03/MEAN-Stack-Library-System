import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { 
  Member, 
  MemberRequest, 
  PaginatedMembers,
  BorrowRequest,
  ReturnRequest 
} from '../models/member.model';

@Injectable({
  providedIn: 'root'
})
export class MemberService {
  private apiUrl = `${environment.apiUrl}/members`;

  constructor(private http: HttpClient) { }

  // Get all members with pagination and search
  getMembers(
    page: number = 1,
    limit: number = 10,
    search: string = '',
    isActive?: boolean
  ): Observable<PaginatedMembers> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search) params = params.set('search', search);
    if (isActive !== undefined) params = params.set('isActive', isActive.toString());

    return this.http.get<PaginatedMembers>(this.apiUrl, { params })
      .pipe(catchError(this.handleError));
  }

  // Get single member by ID
  getMemberById(id: string): Observable<Member> {
    return this.http.get<Member>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  // Create new member
  createMember(memberData: MemberRequest): Observable<any> {
    return this.http.post(this.apiUrl, memberData)
      .pipe(catchError(this.handleError));
  }

  // Update member
  updateMember(id: string, memberData: MemberRequest): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, memberData)
      .pipe(catchError(this.handleError));
  }

  // Delete member
  deleteMember(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  // Borrow a book
  borrowBook(memberId: string, borrowData: BorrowRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/${memberId}/borrow`, borrowData)
      .pipe(catchError(this.handleError));
  }

  // Return a book
  returnBook(memberId: string, returnData: ReturnRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/${memberId}/return`, returnData)
      .pipe(catchError(this.handleError));
  }

  // Error handler
  private handleError(error: any): Observable<never> {
    console.error('Member Service Error:', error);
    let errorMessage = 'An error occurred';
    
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.status === 401) {
      errorMessage = 'Unauthorized access';
    } else if (error.status === 403) {
      errorMessage = 'Admin privileges required';
    }
    
    return throwError(() => new Error(errorMessage));
  }
}