const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// @desc    Get all users
// @route   GET /api/v1/users
// @access  Admin
exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find().select('-password');

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: users
  });
});

// @desc    Update user role
// @route   PATCH /api/v1/users/:userId/role
// @access  Admin
exports.updateUserRole = catchAsync(async (req, res, next) => {
  const { role } = req.body;
  const { userId } = req.params;

  // Check if role is valid
  if (!['user', 'organizer', 'admin'].includes(role)) {
    return next(new AppError('Invalid role specified', 400));
  }

  // Prevent admin from changing their own role
  if (req.user.id === userId) {
    return next(new AppError('Admin cannot change their own role', 403));
  }

  const user = await User.findById(userId);

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  user.role = role;
  await user.save();

  res.status(200).json({
    status: 'success',
    data: {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      }
    }
  });
});

// @desc    Delete user
// @route   DELETE /api/v1/users/:userId
// @access  Admin
exports.deleteUser = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  // Prevent admin from deleting themselves
  if (req.user.id === userId) {
    return next(new AppError('Admin cannot delete their own account', 403));
  }

  const user = await User.findById(userId);

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  await user.deleteOne();

  res.status(204).json({
    status: 'success',
    data: null
  });
}); 