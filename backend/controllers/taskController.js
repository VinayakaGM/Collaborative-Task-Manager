const { validationResult } = require('express-validator');
const Task = require('../models/Task');
const Activity = require('../models/Activity');

const logActivity = async (taskId, taskTitle, performedBy, action, details = {}) => {
  try {
    await Activity.create({ task: taskId, taskTitle, performedBy, action, details });
  } catch (err) {
    console.error('Activity log error:', err);
  }
};

const emitTaskEvent = (req, event, data) => {
  const io = req.app.get('io');
  if (io) io.emit(event, data);
};

// GET /api/tasks — with pagination, filtering
exports.getTasks = async (req, res) => {
  try {
    const { status, priority, assignedTo, page = 1, limit = 20, search } = req.query;
    const query = {};

    // Role-based filtering
    if (req.user.role === 'user') {
      query.assignedTo = req.user._id;
    } else {
      // Managers see all tasks, optionally filtered
      if (assignedTo) query.assignedTo = assignedTo;
    }

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (search) query.title = { $regex: search, $options: 'i' };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Task.countDocuments(query);

    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email avatar role')
      .populate('createdBy', 'name email avatar role')
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      tasks,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error('Get tasks error:', err);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email avatar role')
      .populate('createdBy', 'name email avatar role');

    if (!task) return res.status(404).json({ error: 'Task not found' });

    // Users can only see their own tasks
    if (req.user.role === 'user' && task.assignedTo._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ task });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch task' });
  }
};

exports.createTask = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, status, priority, assignedTo, dueDate, tags } = req.body;

    const task = await Task.create({
      title, description, status, priority, assignedTo, dueDate, tags,
      createdBy: req.user._id,
    });

    const populated = await task.populate([
      { path: 'assignedTo', select: 'name email avatar role' },
      { path: 'createdBy', select: 'name email avatar role' },
    ]);

    await logActivity(task._id, task.title, req.user._id, 'created', { title, priority, assignedTo });
    emitTaskEvent(req, 'task:created', { task: populated });

    res.status(201).json({ message: 'Task created', task: populated });
  } catch (err) {
    console.error('Create task error:', err);
    res.status(500).json({ error: 'Failed to create task' });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const before = { status: task.status, priority: task.priority, assignedTo: task.assignedTo };
    const { title, description, status, priority, assignedTo, dueDate, tags } = req.body;

    Object.assign(task, { title, description, status, priority, assignedTo, dueDate, tags });
    await task.save();

    const populated = await task.populate([
      { path: 'assignedTo', select: 'name email avatar role' },
      { path: 'createdBy', select: 'name email avatar role' },
    ]);

    await logActivity(task._id, task.title, req.user._id, 'updated', { before, after: { status, priority, assignedTo } });
    emitTaskEvent(req, 'task:updated', { task: populated });

    res.json({ message: 'Task updated', task: populated });
  } catch (err) {
    console.error('Update task error:', err);
    res.status(500).json({ error: 'Failed to update task' });
  }
};

exports.updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['todo', 'in-progress', 'review', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    // Users can only update their own tasks
    if (req.user.role === 'user' && task.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const prevStatus = task.status;
    task.status = status;
    await task.save();

    const populated = await task.populate([
      { path: 'assignedTo', select: 'name email avatar role' },
      { path: 'createdBy', select: 'name email avatar role' },
    ]);

    await logActivity(task._id, task.title, req.user._id, 'status_changed', { from: prevStatus, to: status });
    emitTaskEvent(req, 'task:updated', { task: populated });

    res.json({ message: 'Status updated', task: populated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update status' });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    await logActivity(task._id, task.title, req.user._id, 'deleted', { title: task.title });
    await task.deleteOne();
    emitTaskEvent(req, 'task:deleted', { taskId: req.params.id });

    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
};

exports.getStats = async (req, res) => {
  try {
    const query = req.user.role === 'user' ? { assignedTo: req.user._id } : {};

    const [total, byStatus, byPriority, overdue] = await Promise.all([
      Task.countDocuments(query),
      Task.aggregate([
        { $match: query },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Task.aggregate([
        { $match: query },
        { $group: { _id: '$priority', count: { $sum: 1 } } },
      ]),
      Task.countDocuments({
        ...query,
        dueDate: { $lt: new Date() },
        status: { $ne: 'completed' },
      }),
    ]);

    res.json({ total, byStatus, byPriority, overdue });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};

exports.reorderTasks = async (req, res) => {
  try {
    const { tasks } = req.body; // [{ id, order }]
    const updates = tasks.map(({ id, order }) =>
      Task.findByIdAndUpdate(id, { order })
    );
    await Promise.all(updates);
    const io = req.app.get('io');
    if (io) io.emit('task:reordered', { tasks });
    res.json({ message: 'Tasks reordered' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reorder tasks' });
  }
};
