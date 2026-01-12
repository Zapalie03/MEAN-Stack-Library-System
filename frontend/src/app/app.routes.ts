import { Routes } from '@angular/router';
import { LoginComponent } from './components/login.component';
import { RegisterComponent } from './components/register.component';
import { DashboardComponent } from './components/dashboard.component';
import { BooksListComponent } from './components/books-list.component';
import { BookFormComponent } from './components/book-form.component';
import { BookDetailsComponent } from './components/book-details.component';
import { MembersListComponent } from './components/members-list.component';
import { MemberAddComponent } from './components/member-add.component'; // NEW
import { MemberFormComponent } from './components/member-form.component';
import { MemberDetailsComponent } from './components/member-details.component';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  
  // Protected routes
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [authGuard]
  },
  
  // Book routes
  { 
    path: 'books', 
    component: BooksListComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'books/new', 
    component: BookFormComponent,
    canActivate: [authGuard, adminGuard]
  },
  { 
    path: 'books/:id', 
    component: BookDetailsComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'books/:id/edit', 
    component: BookFormComponent,
    canActivate: [authGuard, adminGuard]
  },
  
  // Member routes - SEPARATE ADD ROUTE
  { 
    path: 'members', 
    component: MembersListComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'members/add',  // SEPARATE from :id route
    component: MemberAddComponent,
    canActivate: [authGuard, adminGuard]
  },
  { 
    path: 'members/:id', 
    component: MemberDetailsComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'members/:id/edit', 
    component: MemberFormComponent,
    canActivate: [authGuard, adminGuard]
  },
  
  // Wildcard route
  { path: '**', redirectTo: '/login' }
];