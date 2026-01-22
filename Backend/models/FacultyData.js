const mongoose = require('mongoose');

const facultyDataSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  pendingReviews: {
    type: Number,
    default: 0,
  },
  activeBatches: {
    type: Number,
    default: 0,
  },
  totalStudents: {
    type: Number,
    default: 0,
  },
  upcomingSessions: {
    type: Number,
    default: 0,
  },
  recentActivity: {
    type: mongoose.Schema.Types.Mixed,
    default: [],
  },
  alerts: {
    type: mongoose.Schema.Types.Mixed,
    default: [],
  },
  coursesCreated: {
    type: Number,
    default: 0,
  },
  contentUploaded: {
    type: Number,
    default: 0,
  },
  assignmentsCreated: {
    type: Number,
    default: 0,
  },
  averageGradeGiven: {
    type: Number,
    default: 0,
  },
  lastLoginAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('FacultyData', facultyDataSchema);
