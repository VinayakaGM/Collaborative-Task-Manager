const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      required: true,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      enum: [
        'created',
        'updated',
        'deleted',
        'status_changed',
        'assigned',
        'priority_changed',
        'commented',
      ],
      required: true,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    // Snapshot of task title at time of activity (for deleted tasks)
    taskTitle: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

activitySchema.index({ task: 1, createdAt: -1 });
activitySchema.index({ performedBy: 1, createdAt: -1 });

module.exports = mongoose.model('Activity', activitySchema);
