const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/authMiddleware');
const {
  getAllUsers,
  updateUserRole,
  deleteUser,
} = require('../controllers/userController');

// Protect all routes after this middleware
router.use(protect);

// Restrict to admin only
router.use(restrictTo('admin'));

router
  .route('/')
  .get(getAllUsers);

router
  .route('/:userId/role')
  .patch(updateUserRole);

router
  .route('/:userId')
  .delete(deleteUser);

module.exports = router; 