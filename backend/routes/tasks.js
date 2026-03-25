const express = require('express');
const { body, query } = require('express-validator');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { requireManager } = require('../middleware/auth');

const taskValidation = [
  body('title').trim().isLength({ min: 3, max: 100 }).withMessage('Title must be 3-100 characters'),
  body('description').optional().isLength({ max: 1000 }).withMessage('Description max 1000 chars'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
  body('status').optional().isIn(['todo', 'in-progress', 'review', 'completed']),
  body('assignedTo').isMongoId().withMessage('Valid user ID required'),
  body('dueDate').optional({ nullable: true }).isISO8601().withMessage('Valid date required'),
];

// All users can view their tasks
router.get('/', taskController.getTasks);
router.get('/stats', taskController.getStats);
router.get('/:id', taskController.getTaskById);

// Users can update status of their own tasks; managers can do full edits
router.patch('/:id/status', taskController.updateTaskStatus);

// Only managers can create, fully update, delete
router.post('/', requireManager, taskValidation, taskController.createTask);
router.put('/:id', requireManager, taskValidation, taskController.updateTask);
router.delete('/:id', requireManager, taskController.deleteTask);

// Drag and drop reorder
router.patch('/reorder', requireManager, taskController.reorderTasks);

module.exports = router;
