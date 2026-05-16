const express = require('express');
const router = express.Router();
const {
  listProjects, createProject, getProject,
  updateProject, deleteProject, addMember, removeMember
} = require('../controllers/project.controller');
const { authenticate } = require('../middleware/auth');
const { requireAppRole, requireProjectMember } = require('../middleware/rbac');
const { validate, createProjectSchema, updateProjectSchema, addMemberSchema } = require('../middleware/validate');

// All routes are protected
router.use(authenticate);

router.get('/', listProjects);
router.post('/', requireAppRole('ADMIN'), validate(createProjectSchema), createProject);
router.get('/:id', requireProjectMember(), getProject);
router.put('/:id', requireProjectMember('ADMIN'), validate(updateProjectSchema), updateProject);
router.delete('/:id', requireProjectMember('ADMIN'), deleteProject);

// Member management
router.post('/:id/members', requireProjectMember('ADMIN'), validate(addMemberSchema), addMember);
router.delete('/:id/members/:userId', requireProjectMember('ADMIN'), removeMember);

module.exports = router;
