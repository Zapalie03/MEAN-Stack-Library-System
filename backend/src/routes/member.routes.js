const express = require('express');
const router = express.Router();
const {
  getAllMembers,
  getMemberById,
  createMember,
  updateMember,
  deleteMember,
  borrowBook,
  returnBook
} = require('../controllers/member.controller');
const { authMiddleware, roleMiddleware } = require('../middlewares/auth.middleware');

// All member routes require authentication
router.use(authMiddleware);

router.get('/', getAllMembers);
router.get('/:id', getMemberById);
router.post('/', roleMiddleware('admin'), createMember);
router.put('/:id', roleMiddleware('admin'), updateMember);
router.delete('/:id', roleMiddleware('admin'), deleteMember);
router.post('/:id/borrow', roleMiddleware('admin'), borrowBook);
router.post('/:id/return', roleMiddleware('admin'), returnBook);

module.exports = router;