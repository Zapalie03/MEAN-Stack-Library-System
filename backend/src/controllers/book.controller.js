const Book = require('../models/Book.model');

// Get all books (with pagination and search)
exports.getAllBooks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const search = req.query.search || '';
    const genre = req.query.genre || '';
    
    // Build query
    let query = {};
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { isbn: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (genre) {
      query.genre = genre;
    }
    
    // Get total count for pagination
    const total = await Book.countDocuments(query);
    
    // Get books
    const books = await Book.find(query)
      .populate('addedBy', 'name email')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    
    res.json({
      books,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all books error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single book
exports.getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate('addedBy', 'name email');
    
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    res.json(book);
  } catch (error) {
    console.error('Get book by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new book
exports.createBook = async (req, res) => {
  try {
    const bookData = {
      ...req.body,
      addedBy: req.user.id
    };
    
    const book = new Book(bookData);
    await book.save();
    
    const populatedBook = await Book.findById(book._id).populate('addedBy', 'name email');
    res.status(201).json({
      message: 'Book created successfully',
      book: populatedBook
    });
  } catch (error) {
    console.error('Create book error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    // Handle duplicate ISBN
    if (error.code === 11000) {
      return res.status(400).json({ message: 'ISBN already exists' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};

// Update book
exports.updateBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    // Check if user is admin or the one who added the book
    if (req.user.role !== 'admin' && book.addedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this book' });
    }
    
    // Update book
    const updatedBook = await Book.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('addedBy', 'name email');
    
    res.json({
      message: 'Book updated successfully',
      book: updatedBook
    });
  } catch (error) {
    console.error('Update book error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({ message: 'ISBN already exists' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete book
exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    // Only admin can delete books
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admin can delete books' });
    }
    
    await book.deleteOne();
    
    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    console.error('Delete book error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};