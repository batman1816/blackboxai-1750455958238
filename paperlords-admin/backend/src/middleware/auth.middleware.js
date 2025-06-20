const jwt = require('jsonwebtoken');
const Admin = require('../models/admin.model');

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No authentication token, access denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Find admin by id
    const admin = await Admin.findById(decoded.id).select('-password');
    
    if (!admin) {
      return res.status(401).json({ message: 'Token is invalid' });
    }

    // Attach admin to request object
    req.admin = admin;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is invalid' });
  }
};

// Middleware to check if user is super-admin
const superAdminMiddleware = (req, res, next) => {
  if (req.admin && req.admin.role === 'super-admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Super admin privileges required.' });
  }
};

module.exports = {
  authMiddleware,
  superAdminMiddleware
};
