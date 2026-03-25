const User = require('../models/User');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ isActive: true }).select('-password').sort({ name: 1 });
    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

exports.getAssignableUsers = async (req, res) => {
  try {
    const users = await User.find({ isActive: true })
      .select('name email avatar role')
      .sort({ name: 1 });
    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};
