const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

// All routes require authentication (handled by middleware in server.js)

// Get all tasks (with optional filters: status, priority, search)
router.get('/', taskController.getTasks);

// Get single task by ID
router.get('/:id', taskController.getTask);

// Create a new task
router.post('/', taskController.createTask);

// Update a task
router.put('/:id', taskController.updateTask);

// Delete a task
router.delete('/:id', taskController.deleteTask);

// Toggle task status (Pending <-> Completed)
router.patch('/:id/toggle', taskController.toggleTaskStatus);

module.exports = router;
