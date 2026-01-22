const mongoose = require('mongoose');

const assignmentSubmissionSchema = new mongoose.Schema({
  assignmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: true,
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  attachments: [{
    fileName: String,
    fileUrl: String,
    fileSize: Number,
    uploadedAt: Date,
  }],
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['pending', 'graded', 'late', 'resubmitted'],
    default: 'pending',
  },
  pointsEarned: {
    type: Number,
    min: 0,
  },
  grade: {
    type: String,
    enum: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F'],
  },
  feedback: {
    type: String,
    trim: true,
  },
  rubricScores: {
    type: mongoose.Schema.Types.Mixed,
  },
  isLate: {
    type: Boolean,
    default: false,
  },
  lateSubmissionTime: {
    type: Date,
  },
  gradedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  gradedAt: {
    type: Date,
  },
  attemptNumber: {
    type: Number,
    default: 1,
    min: 1,
  },
}, {
  timestamps: true,
});

// Compound index to ensure unique submission per student per assignment (for latest attempt)
assignmentSubmissionSchema.index({ assignmentId: 1, studentId: 1, attemptNumber: 1 }, { unique: true });
assignmentSubmissionSchema.index({ assignmentId: 1, status: 1 });
assignmentSubmissionSchema.index({ studentId: 1 });
assignmentSubmissionSchema.index({ gradedBy: 1 });

module.exports = mongoose.model('AssignmentSubmission', assignmentSubmissionSchema);