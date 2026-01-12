const mongoose = require('mongoose');
require('dotenv').config();

// Use the actual models from your application
const User = require('./src/models/User.model');
const Book = require('./src/models/Book.model');
const Member = require('./src/models/Member.model');

async function addTestData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Get admin user
    const adminUser = await User.findOne({ email: 'admin@library.com' });
    if (!adminUser) {
      console.log('Admin user not found. Run create-admin.js first.');
      return;
    }

    console.log(`👤 Using admin: ${adminUser.name} (${adminUser.email})`);

    // Check if data already exists
    const bookCount = await Book.countDocuments();
    const memberCount = await Member.countDocuments();

    if (bookCount > 0 || memberCount > 0) {
      console.log('ℹData already exists in database');
      console.log(`Books: ${bookCount}, 👥 Members: ${memberCount}`);
      return;
    }

    console.log('📚 Adding test books...');
    
    // Add test books
    const testBooks = [
      {
        title: 'Introduction to Angular',
        author: 'John Doe',
        isbn: '978-1234567891',
        publishedYear: 2023,
        genre: 'Technology',
        copiesAvailable: 5,
        totalCopies: 5,
        description: 'A comprehensive guide to Angular development',
        addedBy: adminUser._id
      },
      {
        title: 'Node.js for Beginners',
        author: 'Jane Smith',
        isbn: '978-1234567892',
        publishedYear: 2022,
        genre: 'Technology',
        copiesAvailable: 3,
        totalCopies: 5,
        description: 'Learn Node.js from scratch',
        addedBy: adminUser._id
      },
      {
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        isbn: '978-0743273565',
        publishedYear: 1925,
        genre: 'Fiction',
        copiesAvailable: 8,
        totalCopies: 10,
        description: 'Classic American novel',
        addedBy: adminUser._id
      },
      {
        title: 'Clean Code',
        author: 'Robert C. Martin',
        isbn: '978-0132350884',
        publishedYear: 2008,
        genre: 'Technology',
        copiesAvailable: 2,
        totalCopies: 4,
        description: 'A handbook of agile software craftsmanship',
        addedBy: adminUser._id
      },
      {
        title: 'To Kill a Mockingbird',
        author: 'Harper Lee',
        isbn: '978-0446310789',
        publishedYear: 1960,
        genre: 'Fiction',
        copiesAvailable: 6,
        totalCopies: 8,
        description: 'Pulitzer Prize-winning novel',
        addedBy: adminUser._id
      }
    ];

    await Book.insertMany(testBooks);
    console.log('5 test books added');

    console.log('Adding test members...');
    
    // Add test members
    const testMembers = [
      {
        firstName: 'Alice',
        lastName: 'Johnson',
        email: 'alice@example.com',
        phone: '123-456-7890',
        membershipType: 'Premium',
        isActive: true,
        createdBy: adminUser._id
      },
      {
        firstName: 'Bob',
        lastName: 'Williams',
        email: 'bob@example.com',
        phone: '123-456-7891',
        membershipType: 'Regular',
        isActive: true,
        createdBy: adminUser._id
      },
      {
        firstName: 'Charlie',
        lastName: 'Brown',
        email: 'charlie@example.com',
        phone: '123-456-7892',
        membershipType: 'Student',
        isActive: true,
        createdBy: adminUser._id
      },
      {
        firstName: 'Diana',
        lastName: 'Miller',
        email: 'diana@example.com',
        phone: '123-456-7893',
        membershipType: 'Regular',
        isActive: false,
        createdBy: adminUser._id
      }
    ];

    await Member.insertMany(testMembers);
    console.log('4 test members added');

    console.log('Test data added successfully!');
    console.log('\nDashboard should now show:');
    console.log('5 Books');
    console.log('4 Members');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

addTestData();