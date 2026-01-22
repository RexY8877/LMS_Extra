const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  batchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch',
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ['coding', 'written', 'file_upload'],
    required: true,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  totalPoints: {
    type: Number,
    required: true,
    min: 0,
  },
  instructions: {
    type: String,
    trim: true,
  },
  attachments: [{
    fileName: String,
    fileUrl: String,
    fileSize: Number,
  }],
  rubric: {
    type: mongoose.Schema.Types.Mixed,
  },
  allowLateSubmissions: {
    type: Boolean,
    default: true,
  },
  latePenalty: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
  },
}, {
  timestamps: true,
});

// Index for efficient queries
assignmentSchema.index({ batchId: 1, dueDate: 1 });
assignmentSchema.index({ createdBy: 1 });
assignmentSchema.index({ type: 1 });

module.exports = mongoose.model('Assignment', assignmentSchema);