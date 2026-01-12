const jwt = require('jsonwebtoken');
const User = require('../models/User.model');

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    console.log('Auth Middleware - Authorization header:', authHeader);
    
    if (!authHeader) {
      console.log('No Authorization header found');
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Extract token (handles both "Bearer <token>" and just "<token>")
    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.replace('Bearer ', '') 
      : authHeader;
    
    console.log('Auth Middleware - Token extracted:', token.substring(0, 20) + '...');
    
    // For testing with dummy token from test server
    if (token === 'test-token-123' || token === 'test-token-456') {
      console.log('Using test token for development');
      // Create a mock admin user for testing
      req.user = {
        _id: 'test-admin-id',
        name: 'Library Admin',
        email: 'admin@library.com',
        role: 'admin'
      };
      req.token = token;
      console.log('Test user attached to request');
      return next();
    }

    // Verify JWT token
    console.log('Verifying JWT token...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('JWT decoded:', decoded);
    
    // Find user
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      console.log('User not found for ID:', decoded.userId);
      return res.status(401).json({ message: 'User not found' });
    }

    console.log('User found:', user.email, 'Role:', user.role);
    
    // Attach user to request
    req.user = user;
    req.token = token;
    console.log('User attached to request');
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    
    res.status(401).json({ message: 'Token is not valid' });
  }
};

const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    console.log('Role Middleware checking...');
    console.log('Request user:', req.user);
    console.log('Allowed roles:', allowedRoles);
    
    if (!req.user) {
      console.log('No user attached to request');
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      console.log(`User role '${req.user.role}' not in allowed roles:`, allowedRoles);
      return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
    }
    
    console.log(`✅ Role check passed: ${req.user.role} is allowed`);
    next();
  };
};

module.exports = { authMiddleware, roleMiddleware };