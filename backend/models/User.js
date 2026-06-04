const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

// User Schema
const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    minlength: [2, 'First name must be at least 2 characters'],
    maxlength: [50, 'First name must not exceed 50 characters']
  },
  
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    minlength: [2, 'Last name must be at least 2 characters'],
    maxlength: [50, 'Last name must not exceed 50 characters']
  },
  
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email address']
  },
  
  phone: {
    type: String,
    trim: true,
    validate: [
      function(value) {
        return !value || validator.isMobilePhone(value, 'any', { strictMode: false });
      },
      'Please provide a valid phone number'
    ]
  },
  
  company: {
    type: String,
    trim: true,
    maxlength: [100, 'Company name must not exceed 100 characters']
  },
  
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false, // Don't return password by default
    validate: [
      function(value) {
        // At least one uppercase, one lowercase, one number, one special character
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/.test(value);
      },
      'Password must contain uppercase, lowercase, number, and special character'
    ]
  },
  
  role: {
    type: String,
    enum: ['user', 'admin', 'merchant'],
    default: 'user'
  },
  
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  
  passwordResetToken: String,
  passwordResetExpires: Date,
  
  lastLogin: Date,
  
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  
  twoFactorSecret: String,
  
  loginAttempts: {
    type: Number,
    default: 0
  },
  
  lockUntil: Date,
  
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  
  metadata: {
    ipAddress: String,
    userAgent: String,
    lastDeviceUsed: String
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ createdAt: -1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash password if it has been modified
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(passwordInput) {
  return await bcrypt.compare(passwordInput, this.password);
};

// Method to check if account is locked
userSchema.methods.isAccountLocked = function() {
  return this.lockUntil && this.lockUntil > Date.now();
};

// Method to increment login attempts
userSchema.methods.incLoginAttempts = async function() {
  // Reset login attempts if lock has expired
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    });
  }

  // Increment attempts
  const updates = { $inc: { loginAttempts: 1 } };

  // Lock the account if max attempts reached
  const maxAttempts = 5;
  const lockTime = 30 * 60 * 1000; // 30 minutes

  if (this.loginAttempts + 1 >= maxAttempts && !this.isAccountLocked()) {
    updates.$set = { lockUntil: new Date(Date.now() + lockTime) };
  }

  return this.updateOne(updates);
};

// Method to reset login attempts
userSchema.methods.resetLoginAttempts = async function() {
  return this.updateOne({
    $set: { loginAttempts: 0 },
    $unset: { lockUntil: 1 }
  });
};

// Method to get full name
userSchema.methods.getFullName = function() {
  return `${this.firstName} ${this.lastName}`;
};

// Method to get public profile
userSchema.methods.getPublicProfile = function() {
  return {
    id: this._id,
    firstName: this.firstName,
    lastName: this.lastName,
    email: this.email,
    phone: this.phone,
    company: this.company,
    role: this.role,
    isEmailVerified: this.isEmailVerified,
    twoFactorEnabled: this.twoFactorEnabled,
    createdAt: this.createdAt
  };
};

module.exports = mongoose.model('User', userSchema);
