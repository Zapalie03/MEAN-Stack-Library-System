const Member = require('../models/Member.model');

// Get all members
exports.getAllMembers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const search = req.query.search || '';
    
    let query = {};
    
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (req.query.isActive !== undefined) {
      query.isActive = req.query.isActive === 'true';
    }
    
    const total = await Member.countDocuments(query);
    
    const members = await Member.find(query)
      .populate('createdBy', 'name email')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    
    res.json({
      members,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all members error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single member with timeout protection
exports.getMemberById = async (req, res) => {
  try {
    const memberId = req.params.id;
    console.log('🔍 Fetching member by ID:', memberId);
    
    // Add timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), 10000);
    });
    
    const memberPromise = Member.findById(memberId)
      .populate('createdBy', 'name email')
      .lean(); // Use lean() for faster query
    
    // Race between the member query and timeout
    const member = await Promise.race([memberPromise, timeoutPromise]);
    
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }
    
    // If there are borrowed books, populate them separately
    if (member.booksBorrowed && member.booksBorrowed.length > 0) {
      // Get all book IDs from borrowed books
      const bookIds = member.booksBorrowed.map(item => item.book);
      
      // Fetch books separately
      const books = await Book.find({ _id: { $in: bookIds } })
        .select('title author isbn')
        .lean();
      
      // Create a map for quick lookup
      const bookMap = {};
      books.forEach(book => {
        bookMap[book._id.toString()] = book;
      });
      
      // Attach book details to borrowed books
      member.booksBorrowed = member.booksBorrowed.map(item => ({
        ...item,
        book: bookMap[item.book.toString()] || { title: 'Unknown Book' }
      }));
    }
    
    console.log('Member found and processed:', member._id);
    res.json(member);
  } catch (error) {
    console.error('Get member by ID error:', error.message);
    if (error.message === 'Request timeout') {
      return res.status(504).json({ message: 'Request timeout' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create new member
exports.createMember = async (req, res) => {
  try {
    const memberData = {
      ...req.body,
      createdBy: req.user.id
    };
    
    const member = new Member(memberData);
    await member.save();
    
    const populatedMember = await Member.findById(member._id)
      .populate('createdBy', 'name email');
    
    res.status(201).json({
      message: 'Member created successfully',
      member: populatedMember
    });
  } catch (error) {
    console.error('Create member error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};

// Update member
exports.updateMember = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }
    
    const updatedMember = await Member.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');
    
    res.json({
      message: 'Member updated successfully',
      member: updatedMember
    });
  } catch (error) {
    console.error('Update member error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete member
exports.deleteMember = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }
    
    // Check if member has borrowed books
    const hasBorrowedBooks = member.booksBorrowed.some(book => !book.returned);
    if (hasBorrowedBooks) {
      return res.status(400).json({ 
        message: 'Cannot delete member with borrowed books. Return all books first.' 
      });
    }
    
    await member.deleteOne();
    
    res.json({ message: 'Member deleted successfully' });
  } catch (error) {
    console.error('Delete member error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Borrow a book
exports.borrowBook = async (req, res) => {
  try {
    const { bookId, dueDays = 14 } = req.body;
    const memberId = req.params.id;
    
    const member = await Member.findById(memberId);
    const borrowDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + parseInt(dueDays));
    
    // Add to borrowed books
    member.booksBorrowed.push({
      book: bookId,
      borrowedDate: borrowDate,
      dueDate: dueDate,
      returned: false
    });
    
    await member.save();
    
    res.json({
      message: 'Book borrowed successfully',
      member: await Member.findById(memberId).populate('booksBorrowed.book', 'title author')
    });
  } catch (error) {
    console.error('Borrow book error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Return a book
exports.returnBook = async (req, res) => {
  try {
    const { borrowId } = req.body;
    const memberId = req.params.id;
    
    const member = await Member.findById(memberId);
    const borrowedBook = member.booksBorrowed.id(borrowId);
    
    if (!borrowedBook) {
      return res.status(404).json({ message: 'Borrow record not found' });
    }
    
    borrowedBook.returned = true;
    borrowedBook.returnedDate = new Date();
    
    await member.save();
    
    res.json({
      message: 'Book returned successfully',
      member: await Member.findById(memberId).populate('booksBorrowed.book', 'title author')
    });
  } catch (error) {
    console.error('Return book error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};