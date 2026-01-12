const mongoose = require('mongoose');
const User = require('./src/models/User.model');
require('dotenv').config();

async function createAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@library.com' });
    
    if (existingAdmin) {
      console.log('ℹAdmin user already exists');
      console.log(`Email: ${existingAdmin.email}`);
      console.log(`Name: ${existingAdmin.name}`);
      console.log(`Role: ${existingAdmin.role}`);
      
      // Reset password to known value
      existingAdmin.password = 'admin123';
      await existingAdmin.save();
      console.log('Admin password reset to: admin123');
    } else {
      // Create new admin user
      const adminUser = new User({
        name: 'Library Admin',
        email: 'admin@library.com',
        password: 'admin123', // Will be hashed by the pre-save hook
        role: 'admin'
      });
      
      await adminUser.save();
      console.log('Admin user created successfully!');
      console.log('Email: admin@library.com');
      console.log('Password: admin123');
      console.log('Role: admin');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

createAdmin();