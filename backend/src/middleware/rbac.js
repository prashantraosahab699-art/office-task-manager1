const prisma = require('../utils/prisma');

// Check if user has a specific app-level role
function requireAppRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: `Forbidden. Required role: ${roles.join(' or ')}. Your role: ${req.user.role}` 
      });
    }
    next();
  };
}

// Check if user is a member of the project and optionally check project role
function requireProjectMember(...requiredRoles) {
  return async (req, res, next) => {
    try {
      const projectId = req.params.id || req.params.projectId;
      if (!projectId) {
        return res.status(400).json({ error: 'Project ID is required.' });
      }

      // App-level ADMINs can access any project
      if (req.user.role === 'ADMIN') {
        // Still fetch membership to attach project role context
        const membership = await prisma.projectMember.findUnique({
          where: { projectId_userId: { projectId, userId: req.user.id } }
        });
        req.projectRole = membership ? membership.role : 'ADMIN';
        req.projectId = projectId;
        return next();
      }

      const membership = await prisma.projectMember.findUnique({
        where: { projectId_userId: { projectId, userId: req.user.id } }
      });

      if (!membership) {
        return res.status(403).json({ error: 'You are not a member of this project.' });
      }

      if (requiredRoles.length > 0 && !requiredRoles.includes(membership.role)) {
        return res.status(403).json({ 
          error: `Forbidden. Required project role: ${requiredRoles.join(' or ')}. Your project role: ${membership.role}` 
        });
      }

      req.projectRole = membership.role;
      req.projectId = projectId;
      next();
    } catch (error) {
      next(error);
    }
  };
}

module.exports = { requireAppRole, requireProjectMember };
