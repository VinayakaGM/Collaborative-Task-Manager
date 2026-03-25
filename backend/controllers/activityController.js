const Activity = require('../models/Activity');

exports.getActivities = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = req.user.role === 'user' ? { performedBy: req.user._id } : {};
    const total = await Activity.countDocuments(query);

    const activities = await Activity.find(query)
      .populate('performedBy', 'name email avatar')
      .populate('task', 'title status')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      activities,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
};

exports.getTaskActivities = async (req, res) => {
  try {
    const activities = await Activity.find({ task: req.params.taskId })
      .populate('performedBy', 'name email avatar')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ activities });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch task activities' });
  }
};
