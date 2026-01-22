const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  duration: {
    type: Number,
    required: true,
    min: 1,
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    required: true,
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft',
  },
  facultyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  thumbnailUrl: {
    type: String,
  },
  estimatedHours: {
    type: Number,
    min: 0,
  },
  tags: [{
    type: String,
    trim: true,
  }],
  prerequisites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
  }],
}, {
  timestamps: true,
});

// Index for efficient queries
courseSchema.index({ facultyId: 1, status: 1 });
courseSchema.index({ difficulty: 1, status: 1 });

module.exports = mongoose.model('Course', courseSchema);