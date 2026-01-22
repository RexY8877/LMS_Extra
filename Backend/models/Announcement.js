const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  facultyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  message: {
    type: String,
    required: true,
    trim: true,
  },
  targetType: {
    type: String,
    enum: ['batch', 'course', 'individual', 'all'],
    required: true,
  },
  targetIds: [{
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  }],
  priority: {
    type: String,
    enum: ['normal', 'urgent', 'low'],
    default: 'normal',
  },
  scheduledFor: {
    type: Date,
  },
  sentAt: {
    type: Date,
  },
  attachments: [{
    fileName: String,
    fileUrl: String,
    fileSize: Number,
  }],
  readBy: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    readAt: {
      type: Date,
      default: Date.now,
    },
  }],
  allowReplies: {
    type: Boolean,
    default: true,
  },
  expiresAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Index for efficient queries
announcementSchema.index({ facultyId: 1, createdAt: -1 });
announcementSchema.index({ targetType: 1, targetIds: 1 });
announcementSchema.index({ scheduledFor: 1 });
announcementSchema.index({ priority: 1, sentAt: 1 });

module.exports = mongoose.model('Announcement', announcementSchema);