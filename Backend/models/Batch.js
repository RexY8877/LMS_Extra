const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  facultyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'archived', 'completed'],
    default: 'active',
  },
  studentCount: {
    type: Number,
    default: 0,
  },
  description: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

// Index for efficient queries
batchSchema.index({ facultyId: 1, status: 1 });
batchSchema.index({ courseId: 1 });

module.exports = mongoose.model('Batch', batchSchema);