# Library Management System - MEAN Stack

## Project Overview
A complete full-stack web application for managing library operations built with the MEAN stack (MongoDB, Express.js, Angular, Node.js). This project demonstrates full-stack development skills with user authentication, CRUD operations, and cloud deployment.

## Features

### Authentication & Authorization
- User registration/login with JWT tokens
- Password hashing using bcrypt
- Two user roles: Admin and Regular User
- Role-based route protection with Angular guards

### Book Management
- Full CRUD operations (Create, Read, Update, Delete)
- Search and filter functionality
- Pagination (10 items per page)
- Form validation and error handling

### Member Management
- Manage library members with status tracking
- Different membership types (Regular, Premium, Student)
- Form validation and data integrity

### Dashboard
- Real-time statistics display
- Recent activities tracking
- Responsive design for all devices
- Quick action buttons

## 🛠 Technology Stack

### Frontend
- **Framework:** Angular 17 (Standalone Components)
- **Language:** TypeScript 5.2
- **UI Library:** Bootstrap 5.3, Bootstrap Icons
- **State Management:** RxJS 7.8
- **Notifications:** ngx-toastr

### Backend
- **Runtime:** Node.js 20.x
- **Framework:** Express.js 4.18
- **Database:** MongoDB Atlas
- **ODM:** Mongoose 8.0
- **Authentication:** JWT, bcryptjs

### Deployment
- **Frontend:** Vercel
- **Backend:** Render
- **Database:** MongoDB Atlas (Cloud)

## Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)
- Angular CLI (v17 or higher)
- MongoDB Atlas account

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm run dev