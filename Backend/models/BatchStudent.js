const mongoose = require('mongoose');

const batchStudentSchema = new mongoose.Schema({
  batchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch',
    required: true,
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  enrolledAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['active', 'dropped', 'completed', 'transferred'],
    default: 'active',
  },
  enrolledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  completionDate: {
    type: Date,
  },
  finalGrade: {
    type: String,
    enum: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F'],
  },
  notes: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

// Compound index to ensure unique enrollment per student per batch
batchStudentSchema.index({ batchId: 1, studentId: 1 }, { unique: true });
batchStudentSchema.index({ batchId: 1, status: 1 });
batchStudentSchema.index({ studentId: 1, status: 1 });

module.exports = mongoose.model('BatchStudent', batchStudentSchema);