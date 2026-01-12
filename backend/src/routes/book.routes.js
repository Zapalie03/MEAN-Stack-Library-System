const express = require('express');
const router = express.Router();
const {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook
} = require('../controllers/book.controller');
const { authMiddleware, roleMiddleware } = require('../middlewares/auth.middleware');

// Public routes (anyone can view)
router.get('/', getAllBooks);
router.get('/:id', getBookById);

// Protected routes
router.post('/', authMiddleware, roleMiddleware('admin'), createBook);
router.put('/:id', authMiddleware, roleMiddleware('admin'), updateBook);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), deleteBook);

module.exports = router;