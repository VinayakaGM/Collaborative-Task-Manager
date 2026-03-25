const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { requireManager } = require('../middleware/auth');

// Get all users (managers need this to assign tasks)
router.get('/', requireManager, userController.getAllUsers);
router.get('/assignable', requireManager, userController.getAssignableUsers);
router.get('/:id', userController.getUserById);

module.exports = router;
