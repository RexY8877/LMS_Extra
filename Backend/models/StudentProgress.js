const mongoose = require('mongoose');

const studentProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  batchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch',
  },
  totalSolved: {
    type: Number,
    default: 0,
  },
  easySolved: {
    type: Number,
    default: 0,
  },
  mediumSolved: {
    type: Number,
    default: 0,
  },
  hardSolved: {
    type: Number,
    default: 0,
  },
  totalSubmissions: {
    type: Number,
    default: 0,
  },
  acceptedSubmissions: {
    type: Number,
    default: 0,
  },
  acceptanceRate: {
    type: Number,
    default: 0.0,
  },
  solvedByTopic: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  dailyActivity: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  streak: {
    type: Number,
    default: 0,
  },
  lastSolvedAt: {
    type: Date,
  },
  // Faculty Tools extensions
  overallProgress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  codingProgress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  writingProgress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  readingProgress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  speakingProgress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  behavioralProgress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  assignmentsCompleted: {
    type: Number,
    default: 0,
  },
  totalAssignments: {
    type: Number,
    default: 0,
  },
  averageGrade: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  lastActivityAt: {
    type: Date,
  },
  performanceLevel: {
    type: String,
    enum: ['Excellent', 'Good', 'Needs Improvement', 'At Risk'],
    default: 'Needs Improvement',
  },
  batchRank: {
    type: Number,
    min: 1,
  },
  attendanceRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  engagementScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
}, {
  timestamps: true,
});

// Index for efficient queries
studentProgressSchema.index({ batchId: 1, performanceLevel: 1 });
studentProgressSchema.index({ batchId: 1, batchRank: 1 });
studentProgressSchema.index({ userId: 1, batchId: 1 });

module.exports = mongoose.model('StudentProgress', studentProgressSchema);
