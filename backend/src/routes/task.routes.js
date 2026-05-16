const express = require('express');
const router = express.Router();
const {
  listTasks, createTask, getTask, updateTask, deleteTask, getDashboardStats
} = require('../controllers/task.controller');
const { authenticate } = require('../middleware/auth');
const { requireProjectMember } = require('../middleware/rbac');
const { validate, createTaskSchema, updateTaskSchema } = require('../middleware/validate');

// All routes are protected
router.use(authenticate);

// Dashboard stats (must be before /:id routes)
router.get('/dashboard/stats', getDashboardStats);

// Task routes (scoped under project)
router.get('/:id/tasks', requireProjectMember(), listTasks);
router.post('/:id/tasks', requireProjectMember(), validate(createTaskSchema), createTask);
router.get('/:id/tasks/:taskId', requireProjectMember(), getTask);
router.put('/:id/tasks/:taskId', requireProjectMember(), validate(updateTaskSchema), updateTask);
router.delete('/:id/tasks/:taskId', requireProjectMember('ADMIN'), deleteTask);

module.exports = router;
