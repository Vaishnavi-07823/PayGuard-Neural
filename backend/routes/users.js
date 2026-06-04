const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

const router = express.Router();

// Middleware to verify JWT
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your_jwt_secret_key_here'
    );
    req.userId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

/**
 * @route   GET /api/users/profile
 * @desc    Get user profile
 * @access  Private
 */
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Profile fetched successfully',
      user: user.getPublicProfile()
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch profile', error: error.message });
  }
});

/**
 * @route   PUT /api/users/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put(
  '/profile',
  verifyToken,
  [
    body('firstName').optional().trim().isLength({ min: 2 }),
    body('lastName').optional().trim().isLength({ min: 2 }),
    body('phone').optional().trim(),
    body('company').optional().trim()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          message: 'Validation failed',
          errors: errors.array() 
        });
      }

      const { firstName, lastName, phone, company } = req.body;
      
      const user = await User.findById(req.userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Update fields if provided
      if (firstName) user.firstName = firstName;
      if (lastName) user.lastName = lastName;
      if (phone) user.phone = phone;
      if (company) user.company = company;

      await user.save();

      res.json({
        message: 'Profile updated successfully',
        user: user.getPublicProfile()
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to update profile', error: error.message });
    }
  }
);

/**
 * @route   PUT /api/users/password
 * @desc    Change user password
 * @access  Private
 */
router.put(
  '/password',
  verifyToken,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('New password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/)
      .withMessage('Password must contain uppercase, lowercase, number, and special character'),
    body('confirmPassword').custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Passwords do not match');
      }
      return true;
    })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          message: 'Validation failed',
          errors: errors.array() 
        });
      }

      const { currentPassword, newPassword } = req.body;
      
      const user = await User.findById(req.userId).select('+password');
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Verify current password
      const isPasswordValid = await user.comparePassword(currentPassword);
      
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }

      // Update password
      user.password = newPassword;
      await user.save();

      res.json({
        message: 'Password changed successfully'
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to change password', error: error.message });
    }
  }
);

/**
 * @route   DELETE /api/users/account
 * @desc    Delete user account
 * @access  Private
 */
router.delete(
  '/account',
  verifyToken,
  [
    body('password').notEmpty().withMessage('Password is required to delete account')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          message: 'Validation failed',
          errors: errors.array() 
        });
      }

      const { password } = req.body;
      
      const user = await User.findById(req.userId).select('+password');
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(password);
      
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Password is incorrect' });
      }

      // Delete user
      await User.findByIdAndDelete(req.userId);

      res.json({
        message: 'Account deleted successfully'
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete account', error: error.message });
    }
  }
);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID (admin only)
 * @access  Private
 */
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'User fetched successfully',
      user: user.getPublicProfile()
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user', error: error.message });
  }
});

module.exports = router;
