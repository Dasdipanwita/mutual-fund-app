import User from '../models/User.mjs';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const register = async (req, res) => {
  try {
    console.log('🚀 Registration request received:', {
      timestamp: new Date().toISOString(),
      body: req.body
    });

    const { name, email, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      console.error('❌ Missing required fields:', {
        timestamp: new Date().toISOString(),
        fields: { name, email, password }
      });
      return res.status(400).json({ 
        success: false,
        message: 'All fields are required',
        fields: { name, email, password }
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error('❌ Invalid email format:', {
        timestamp: new Date().toISOString(),
        email
      });
      return res.status(400).json({ 
        success: false,
        message: 'Invalid email format'
      });
    }

    // Validate password length
    if (password.length < 6) {
      console.error('❌ Password too short:', {
        timestamp: new Date().toISOString(),
        passwordLength: password.length
      });
      return res.status(400).json({ 
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Check for existing user
    console.log('🔍 Checking for existing user with email:', email);
    const userExists = await User.findOne({ email });
    if (userExists) {
      console.error('❌ User already exists:', {
        timestamp: new Date().toISOString(),
        userId: userExists._id
      });
      return res.status(400).json({ 
        success: false,
        message: 'User already exists',
        userId: userExists._id
      });
    }

    // Create user - The pre-save hook in User.mjs will handle hashing.
    console.log('👤 Creating new user for email:', email);
    const user = await User.create({ 
      name, 
      email, 
      password, // Pass the plain password
      savedFunds: []
    });

    // Generate token
    const token = generateToken(user._id);
    console.log('✅ User created successfully:', {
      timestamp: new Date().toISOString(),
      userId: user._id
    });

    // Send response
    res.status(201).json({ 
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('❌ Registration error:', {
      timestamp: new Date().toISOString(),
      error: {
        message: error.message,
        name: error.name,
        stack: error.stack
      },
      request: {
        method: req.method,
        url: req.url,
        body: req.body
      }
    });

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        type: error.name
      } : {}
    });
  }
};

const login = async (req, res) => {
  try {
    console.log('🚀 Login attempt received:', {
      timestamp: new Date().toISOString(),
      email: req.body.email
    });

    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      console.error('❌ Missing credentials:', {
        timestamp: new Date().toISOString(),
        fields: { email, password }
      });
      return res.status(400).json({ 
        success: false,
        message: 'Email and password are required',
        fields: { email, password }
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error('❌ Invalid email format:', {
        timestamp: new Date().toISOString(),
        email
      });
      return res.status(400).json({ 
        success: false,
        message: 'Invalid email format'
      });
    }

    // Find user
    console.log('🔍 Finding user with email:', email);
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.error('❌ User not found:', {
        timestamp: new Date().toISOString(),
        email
      });
      return res.status(400).json({ 
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Verify password
    console.log('🔑 Verifying password for user:', user._id);
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.error('❌ Password mismatch for user:', {
        timestamp: new Date().toISOString(),
        userId: user._id
      });
      return res.status(400).json({ 
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token and send response
    console.log('✅ Login successful for user:', {
      timestamp: new Date().toISOString(),
      userId: user._id
    });
    const token = generateToken(user._id);
    res.json({ 
      success: true,
      message: 'Login successful',
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (error) {
    console.error('❌ Login error:', {
      timestamp: new Date().toISOString(),
      error: {
        message: error.message,
        name: error.name,
        stack: error.stack
      },
      request: {
        method: req.method,
        url: req.url,
        body: req.body
      }
    });
    res.status(500).json({ 
      success: false,
      message: 'Login failed',
      error: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        type: error.name
      } : {}
    });
  }
};

const changePassword = async (req, res) => {
  try {
    console.log('🚀 Change password request received for user:', req.user.id);
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Both old and new passwords are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long.' });
    }

    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect old password.' });
    }

    user.password = newPassword; // The pre-save hook will hash this
    await user.save();

    console.log('✅ Password updated successfully for user:', user._id);
    res.status(200).json({ success: true, message: 'Password updated successfully.' });

  } catch (error) {
    console.error('❌ Change password error:', {
      timestamp: new Date().toISOString(),
      userId: req.user.id,
      error: { message: error.message, name: error.name },
    });
    res.status(500).json({ success: false, message: 'Failed to change password.' });
  }
};

export { register, login, generateToken, changePassword };
