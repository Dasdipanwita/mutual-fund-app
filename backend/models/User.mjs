// models/User.mjs
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: /^\S+@\S+\.\S+$/, // Basic email validation
    validate: {
      validator: function(email) {
        const emailRegex = /^\S+@\S+\.\S+$/;
        return emailRegex.test(email);
      },
      message: props => `${props.value} is not a valid email address`
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false // Don't return password in queries
  },
  savedFunds: [{
    schemeCode: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 0
    },
    purchasePrice: {
      type: Number,
      required: true,
      min: 0
    }
  }]
});

// Pre-save middleware to log user data
userSchema.pre('save', function(next) {
  console.log('🚀 User save middleware:', {
    timestamp: new Date().toISOString(),
    userId: this._id,
    name: this.name,
    email: this.email,
    savedFunds: this.savedFunds
  });
  next();
});

// Pre-save middleware to hash password before saving
userSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    return next();
  }

  try {
    console.log('🔑 Hashing password for user:', this._id);
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    console.log('✅ Password hashed successfully');
    next();
  } catch (error) {
    console.error('❌ Password hashing error:', {
      timestamp: new Date().toISOString(),
      error: {
        message: error.message,
        name: error.name,
        stack: error.stack
      },
      userId: this._id
    });
    next(error);
  }
});

const User = mongoose.model('User', userSchema);

export default User;
