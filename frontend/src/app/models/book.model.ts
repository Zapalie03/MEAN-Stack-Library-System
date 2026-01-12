export interface Book {
  _id: string;
  title: string;
  author: string;
  isbn: string;
  publishedYear: number;
  genre: string;
  copiesAvailable: number;
  totalCopies: number;
  description?: string;
  addedBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: Date;
}

export interface BookRequest {
  title: string;
  author: string;
  isbn: string;
  publishedYear: number;
  genre: string;
  copiesAvailable: number;
  totalCopies: number;
  description?: string;
}

export interface PaginatedBooks {
  books: Book[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const GENRES = [
  'Fiction', 'Non-Fiction', 'Science', 'Technology', 'History', 'Biography', 'Other'
];