const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    required: true,
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'excused'],
    required: true,
  },
  joinTime: {
    type: Date,
  },
  leaveTime: {
    type: Date,
  },
  duration: {
    type: Number, // in minutes
  },
  notes: {
    type: String,
    trim: true,
  },
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  recordedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Compound index to ensure unique attendance per student per session
attendanceSchema.index({ sessionId: 1, studentId: 1 }, { unique: true });
attendanceSchema.index({ sessionId: 1, status: 1 });
attendanceSchema.index({ studentId: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);