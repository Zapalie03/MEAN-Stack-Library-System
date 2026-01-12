export interface Address {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

export interface BorrowedBook {
  _id: string;
  book: {
    _id: string;
    title: string;
    author: string;
    isbn: string;
  };
  borrowedDate: Date;
  dueDate: Date;
  returned: boolean;
  returnedDate?: Date;
}

export interface Member {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: Address;
  membershipDate: Date;
  membershipType: 'Regular' | 'Premium' | 'Student';
  isActive: boolean;
  booksBorrowed: BorrowedBook[];
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: Date;
}

export interface MemberRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: Address;
  membershipType: 'Regular' | 'Premium' | 'Student';
  isActive?: boolean;
}

export interface PaginatedMembers {
  members: Member[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface BorrowRequest {
  bookId: string;
  dueDays: number;
}

export interface ReturnRequest {
  borrowId: string;
}

export const MEMBERSHIP_TYPES = ['Regular', 'Premium', 'Student'];