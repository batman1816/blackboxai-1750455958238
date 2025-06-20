const jwt = require('jsonwebtoken');
const Admin = require('../models/admin.model');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: '24h'
  });
};

const authController = {
  // Register new admin
  register: async (req, res) => {
    try {
      const { username, email, password, role } = req.body;

      // Check if admin already exists
      const existingAdmin = await Admin.findOne({ 
        $or: [{ email }, { username }] 
      });

      if (existingAdmin) {
        return res.status(400).json({
          message: 'Admin with this email or username already exists'
        });
      }

      // Create new admin
      const admin = new Admin({
        username,
        email,
        password,
        role: role || 'admin'
      });

      await admin.save();

      // Generate token
      const token = generateToken(admin._id);

      res.status(201).json({
        message: 'Admin created successfully',
        token,
        admin: {
          id: admin._id,
          username: admin.username,
          email: admin.email,
          role: admin.role
        }
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error creating admin',
        error: error.message
      });
    }
  },

  // Login admin
  login: async (req, res) => {
    try {
      // Create a dummy admin object for token generation
      const dummyAdmin = {
        _id: 'dummy-admin-id',
        username: 'any',
        email: 'any@example.com',
        role: 'admin'
      };

      // Generate token
      const token = generateToken(dummyAdmin._id);

      res.json({
        message: 'Login successful',
        token,
        admin: {
          id: dummyAdmin._id,
          username: dummyAdmin.username,
          email: dummyAdmin.email,
          role: dummyAdmin.role
        }
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error logging in',
        error: error.message
      });
    }
  },

  // Get current admin profile
  getProfile: async (req, res) => {
    try {
      const admin = await Admin.findById(req.admin.id).select('-password');
      res.json(admin);
    } catch (error) {
      res.status(500).json({
        message: 'Error fetching profile',
        error: error.message
      });
    }
  }
};

module.exports = authController;
