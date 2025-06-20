const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authMiddleware, superAdminMiddleware } = require('../middleware/auth.middleware');

// Public routes
router.post('/login', authController.login);

// Protected routes
router.get('/profile', authMiddleware, authController.getProfile);

// Super admin only routes
router.post('/register', [authMiddleware, superAdminMiddleware], authController.register);

module.exports = router;
