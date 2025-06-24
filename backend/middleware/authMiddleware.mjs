import jwt from 'jsonwebtoken';
import User from '../models/User.mjs';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('✅ Token decoded successfully:', decoded);

      // Attach user to the request
      req.userId = decoded.id;
      const user = await User.findById(decoded.id);

      if (!user) {
        return res.status(401).json({ message: 'User not found, token is invalid' });
      }

      console.log(`✅ User ${user.email} authenticated successfully.`);
      next();
    } catch (error) {
      console.error('❌ Token verification failed:', error.message);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    console.error('❌ No token found in authorization header.');
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};
