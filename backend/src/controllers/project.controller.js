const prisma = require('../utils/prisma');

async function listProjects(req, res, next) {
  try {
    let projects;

    if (req.user.role === 'ADMIN') {
      // App ADMINs can see all projects
      projects = await prisma.project.findMany({
        include: {
          createdBy: { select: { id: true, name: true, email: true } },
          members: { include: { user: { select: { id: true, name: true, email: true } } } },
          _count: { select: { tasks: true } }
        },
        orderBy: { createdAt: 'desc' }
      });
    } else {
      // Regular users only see their projects
      projects = await prisma.project.findMany({
        where: {
          members: { some: { userId: req.user.id } }
        },
        include: {
          createdBy: { select: { id: true, name: true, email: true } },
          members: { include: { user: { select: { id: true, name: true, email: true } } } },
          _count: { select: { tasks: true } }
        },
        orderBy: { createdAt: 'desc' }
      });
    }

    // Add computed fields
    const enrichedProjects = await Promise.all(projects.map(async (project) => {
      const openTasks = await prisma.task.count({
        where: { projectId: project.id, status: { not: 'DONE' } }
      });
      return {
        ...project,
        memberCount: project.members.length,
        taskCount: project._count.tasks,
        openTaskCount: openTasks
      };
    }));

    res.json({ projects: enrichedProjects });
  } catch (error) {
    next(error);
  }
}

async function createProject(req, res, next) {
  try {
    const { name, description } = req.body;

    const project = await prisma.project.create({
      data: {
        name,
        description,
        createdById: req.user.id,
        members: {
          create: { userId: req.user.id, role: 'ADMIN' }
        }
      },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        members: { include: { user: { select: { id: true, name: true, email: true } } } }
      }
    });

    res.status(201).json({ project });
  } catch (error) {
    next(error);
  }
}

async function getProject(req, res, next) {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        members: {
          include: { user: { select: { id: true, name: true, email: true, role: true } } }
        },
        tasks: {
          include: {
            assignedTo: { select: { id: true, name: true, email: true } },
            createdBy: { select: { id: true, name: true, email: true } }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    // Add overdue flags to tasks
    const now = new Date();
    project.tasks = project.tasks.map(task => ({
      ...task,
      isOverdue: task.dueDate && new Date(task.dueDate) < now && task.status !== 'DONE'
    }));

    res.json({ project });
  } catch (error) {
    next(error);
  }
}

async function updateProject(req, res, next) {
  try {
    const { name, description } = req.body;

    const project = await prisma.project.update({
      where: { id: req.params.id },
      data: { name, description },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        members: { include: { user: { select: { id: true, name: true, email: true } } } }
      }
    });

    res.json({ project });
  } catch (error) {
    next(error);
  }
}

async function deleteProject(req, res, next) {
  try {
    await prisma.project.delete({ where: { id: req.params.id } });
    res.json({ message: 'Project deleted successfully.' });
  } catch (error) {
    next(error);
  }
}

async function addMember(req, res, next) {
  try {
    const { email, role } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'User with this email not found.' });
    }

    // Check if already a member
    const existingMember = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: req.params.id, userId: user.id } }
    });
    if (existingMember) {
      return res.status(409).json({ error: 'User is already a member of this project.' });
    }

    const member = await prisma.projectMember.create({
      data: {
        projectId: req.params.id,
        userId: user.id,
        role: role || 'MEMBER'
      },
      include: {
        user: { select: { id: true, name: true, email: true } }
      }
    });

    res.status(201).json({ member });
  } catch (error) {
    next(error);
  }
}

async function removeMember(req, res, next) {
  try {
    const { id: projectId, userId } = req.params;

    // Can't remove the project creator
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (project && project.createdById === userId) {
      return res.status(403).json({ error: 'Cannot remove the project creator.' });
    }

    await prisma.projectMember.delete({
      where: { projectId_userId: { projectId, userId } }
    });

    res.json({ message: 'Member removed successfully.' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listProjects, createProject, getProject,
  updateProject, deleteProject, addMember, removeMember
};
