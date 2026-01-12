const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// CORS - Allow Angular frontend
app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true
}));
app.use(express.json());

// Simple test route
app.get('/', (req, res) => {
  res.json({ message: 'API is running!' });
});

// Simple login endpoint for testing
app.post('/api/auth/login', (req, res) => {
  console.log('Login attempt:', req.body);
  
  // Temporary hardcoded user for testing
  if (req.body.email === 'admin@library.com' && req.body.password === 'password123') {
    res.json({
      message: 'Login successful',
      user: {
        id: '123',
        name: 'Admin User',
        email: 'admin@library.com',
        role: 'admin'
      },
      token: 'test-token-123'
    });
  } else {
    res.status(400).json({ message: 'Invalid credentials' });
  }
});

// Simple register endpoint
app.post('/api/auth/register', (req, res) => {
  console.log('Register attempt:', req.body);
  res.json({
    message: 'User registered successfully',
    user: req.body,
    token: 'test-token-456'
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Test server running on http://localhost:${PORT}`);
  console.log(`Test with: POST http://localhost:${PORT}/api/auth/login`);
  console.log(`Test with: POST http://localhost:${PORT}/api/auth/register`);
});