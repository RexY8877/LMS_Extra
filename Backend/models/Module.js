const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
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
  sequence: {
    type: Number,
    required: true,
    min: 1,
  },
  estimatedHours: {
    type: Number,
    min: 0,
    default: 0,
  },
  isRequired: {
    type: Boolean,
    default: true,
  },
  objectives: [{
    type: String,
    trim: true,
  }],
}, {
  timestamps: true,
});

// Compound index to ensure unique sequence per course
moduleSchema.index({ courseId: 1, sequence: 1 }, { unique: true });
moduleSchema.index({ courseId: 1 });

module.exports = mongoose.model('Module', moduleSchema);