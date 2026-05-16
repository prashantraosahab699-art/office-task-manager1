const prisma = require('../utils/prisma');

async function listTasks(req, res, next) {
  try {
    const { id: projectId } = req.params;
    const { status, assignedTo, overdue, priority } = req.query;

    const where = { projectId };

    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assignedTo) where.assignedToId = assignedTo;

    let tasks = await prisma.task.findMany({
      where,
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true, email: true } }
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }]
    });

    const now = new Date();
    tasks = tasks.map(task => ({
      ...task,
      isOverdue: task.dueDate && new Date(task.dueDate) < now && task.status !== 'DONE'
    }));

    // Filter by overdue if requested
    if (overdue === 'true') {
      tasks = tasks.filter(t => t.isOverdue);
    }

    res.json({ tasks });
  } catch (error) {
    next(error);
  }
}

async function createTask(req, res, next) {
  try {
    const { id: projectId } = req.params;
    const { title, description, status, priority, dueDate, assignedToId } = req.body;

    // If assigning to someone, verify they're a project member
    if (assignedToId) {
      const membership = await prisma.projectMember.findUnique({
        where: { projectId_userId: { projectId, userId: assignedToId } }
      });
      if (!membership) {
        return res.status(400).json({ error: 'Assigned user is not a member of this project.' });
      }
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status: status || 'TODO',
        priority: priority || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId,
        assignedToId,
        createdById: req.user.id
      },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true, email: true } }
      }
    });

    const now = new Date();
    task.isOverdue = task.dueDate && new Date(task.dueDate) < now && task.status !== 'DONE';

    res.status(201).json({ task });
  } catch (error) {
    next(error);
  }
}

async function getTask(req, res, next) {
  try {
    const { id: projectId, taskId } = req.params;

    const task = await prisma.task.findFirst({
      where: { id: taskId, projectId },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } }
      }
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    const now = new Date();
    task.isOverdue = task.dueDate && new Date(task.dueDate) < now && task.status !== 'DONE';

    res.json({ task });
  } catch (error) {
    next(error);
  }
}

async function updateTask(req, res, next) {
  try {
    const { id: projectId, taskId } = req.params;
    const { title, description, status, priority, dueDate, assignedToId } = req.body;

    // Fetch the existing task
    const existingTask = await prisma.task.findFirst({
      where: { id: taskId, projectId }
    });

    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    // Authorization: assigned user can update status only; project ADMIN can do everything
    const isProjectAdmin = req.projectRole === 'ADMIN' || req.user.role === 'ADMIN';
    const isAssignee = existingTask.assignedToId === req.user.id;

    if (!isProjectAdmin && !isAssignee) {
      return res.status(403).json({ error: 'You can only update tasks assigned to you.' });
    }

    // Non-admins can only update status
    if (!isProjectAdmin) {
      if (assignedToId !== undefined || title !== undefined || priority !== undefined) {
        return res.status(403).json({ 
          error: 'Only project admins can update task details other than status.' 
        });
      }
    }

    // If reassigning, verify membership
    if (assignedToId) {
      const membership = await prisma.projectMember.findUnique({
        where: { projectId_userId: { projectId, userId: assignedToId } }
      });
      if (!membership) {
        return res.status(400).json({ error: 'Assigned user is not a member of this project.' });
      }
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = priority;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
    if (assignedToId !== undefined) updateData.assignedToId = assignedToId;

    const task = await prisma.task.update({
      where: { id: taskId },
      data: updateData,
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true, email: true } }
      }
    });

    const now = new Date();
    task.isOverdue = task.dueDate && new Date(task.dueDate) < now && task.status !== 'DONE';

    res.json({ task });
  } catch (error) {
    next(error);
  }
}

async function deleteTask(req, res, next) {
  try {
    const { id: projectId, taskId } = req.params;

    const task = await prisma.task.findFirst({ where: { id: taskId, projectId } });
    if (!task) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    await prisma.task.delete({ where: { id: taskId } });
    res.json({ message: 'Task deleted successfully.' });
  } catch (error) {
    next(error);
  }
}

// Dashboard stats endpoint
async function getDashboardStats(req, res, next) {
  try {
    const userId = req.user.id;
    const now = new Date();

    // Get user's projects
    let projectFilter;
    if (req.user.role === 'ADMIN') {
      projectFilter = {};
    } else {
      projectFilter = { members: { some: { userId } } };
    }

    const totalProjects = await prisma.project.count({ where: projectFilter });

    const assignedTasks = await prisma.task.count({
      where: { assignedToId: userId }
    });

    const overdueTasks = await prisma.task.count({
      where: {
        assignedToId: userId,
        dueDate: { lt: now },
        status: { not: 'DONE' }
      }
    });

    const completedTasks = await prisma.task.count({
      where: { assignedToId: userId, status: 'DONE' }
    });

    const todoTasks = await prisma.task.count({
      where: { assignedToId: userId, status: 'TODO' }
    });

    const inProgressTasks = await prisma.task.count({
      where: { assignedToId: userId, status: 'IN_PROGRESS' }
    });

    // Recent tasks
    const recentTasks = await prisma.task.findMany({
      where: {
        project: projectFilter
      },
      include: {
        assignedTo: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } }
      },
      orderBy: { updatedAt: 'desc' },
      take: 10
    });

    const enrichedRecentTasks = recentTasks.map(task => ({
      ...task,
      isOverdue: task.dueDate && new Date(task.dueDate) < now && task.status !== 'DONE'
    }));

    res.json({
      stats: {
        totalProjects,
        assignedTasks,
        overdueTasks,
        completedTasks,
        todoTasks,
        inProgressTasks
      },
      recentTasks: enrichedRecentTasks
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listTasks, createTask, getTask, updateTask, deleteTask, getDashboardStats
};
