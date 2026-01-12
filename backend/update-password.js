const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function updateAdminPassword() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Define User schema
    const userSchema = new mongoose.Schema({
      name: String,
      email: String,
      password: String,
      role: String
    });

    const User = mongoose.model('User', userSchema);

    // Find admin user
    const adminUser = await User.findOne({ email: 'admin@library.com' });
    
    if (!adminUser) {
      console.log('Admin user not found');
      return;
    }

    console.log('Found admin user:', adminUser.email);

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    // Update password
    adminUser.password = hashedPassword;
    await adminUser.save();

    console.log('Password updated successfully!');
    console.log('New password: admin123');
    console.log('(hashed in database for security)');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

updateAdminPassword();