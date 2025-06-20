const express = require('express');
const router = express.Router();
const papersController = require('../controllers/papers.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get papers statistics
router.get('/stats', papersController.getStats);

// CRUD operations
router.post('/', papersController.create);
router.get('/', papersController.getAll);
router.get('/:id', papersController.getById);
router.put('/:id', papersController.update);
router.delete('/:id', papersController.delete);

module.exports = router;
