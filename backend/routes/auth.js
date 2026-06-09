const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

const router = express.Router();


// Helper function to generate JWT
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'your_jwt_secret_key_here',
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

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
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post(
  '/register',
  [
    body('firstName').trim().notEmpty().withMessage('First name is required'),
    body('lastName').trim().notEmpty().withMessage('Last name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/)
      .withMessage('Password must contain uppercase, lowercase, number, and special character'),
    body('confirmPassword').custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    })
  ],
  async (req, res) => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          message: 'Validation failed',
          errors: errors.array() 
        });
      }

      const { firstName, lastName, email, phone, company, password } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already registered' });
      }

      // Create new user
      const user = new User({
        firstName,
        lastName,
        email,
        phone,
        company,
        password,
        role: 'user',
        status: 'active'
      });

      // Save user
      await user.save();

      // Generate token
      const token = generateToken(user._id);

      // Return response
      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: user.getPublicProfile()
      });
    } catch (error) {
      console.error('Registration error:', error);
      
      // Handle duplicate email error
      if (error.code === 11000) {
        return res.status(400).json({ message: 'Email already registered' });
      }

      // Handle validation errors
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(e => e.message);
        return res.status(400).json({ 
          message: 'Validation failed',
          errors: messages 
        });
      }

      res.status(500).json({ message: 'Registration failed', error: error.message });
    }
  }
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  async (req, res) => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          message: 'Validation failed',
          errors: errors.array() 
        });
      }

      const { email, password } = req.body;

      // Find user
      const user = await User.findOne({ email }).select('+password');

      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Check if account is locked
      if (user.isAccountLocked()) {
        return res.status(401).json({ 
          message: 'Account is temporarily locked. Please try again later.' 
        });
      }

      // Compare password
      const isPasswordValid = await user.comparePassword(password);

      if (!isPasswordValid) {
        // Increment login attempts
        await user.incLoginAttempts();
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Check if user is active
      if (user.status !== 'active') {
        return res.status(401).json({ message: 'User account is not active' });
      }

      // Reset login attempts on successful login
      await user.resetLoginAttempts();

      // Update last login
      user.lastLogin = new Date();
      user.metadata = {
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        lastDeviceUsed: req.headers['user-agent']?.split(' ').pop() || 'Unknown'
      };
      await user.save();

      // Generate token
      const token = generateToken(user._id);

      // Return response
      res.json({
        message: 'Login successful',
        token,
        user: user.getPublicProfile()
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Login failed', error: error.message });
    }
  }
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (client-side token removal)
 * @access  Private
 */
router.post('/logout', verifyToken, (req, res) => {
  // Token invalidation should be handled on client-side
  res.json({ message: 'Logout successful' });
});

/**
 * @route   GET /api/auth/verify
 * @desc    Verify token
 * @access  Private
 */
router.get('/verify', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Token is valid',
      user: user.getPublicProfile()
    });
  } catch (error) {
    res.status(500).json({ message: 'Verification failed', error: error.message });
  }
});

/**
 * @route   POST /api/auth/refresh-token
 * @desc    Refresh JWT token
 * @access  Private
 */
router.post('/refresh-token', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const newToken = generateToken(user._id);
    
    res.json({
      message: 'Token refreshed',
      token: newToken
    });
  } catch (error) {
    res.status(500).json({ message: 'Token refresh failed', error: error.message });
  }
});

module.exports = router;
