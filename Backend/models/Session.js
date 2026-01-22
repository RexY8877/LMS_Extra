const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  batchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch',
    required: true,
  },
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
  date: {
    type: Date,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
    min: 15, // minimum 15 minutes
  },
  meetingLink: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled', 'in_progress'],
    default: 'scheduled',
  },
  description: {
    type: String,
    trim: true,
  },
  agenda: [{
    topic: String,
    duration: Number,
  }],
  recordingUrl: {
    type: String,
  },
  attendanceRecorded: {
    type: Boolean,
    default: false,
  },
  materials: [{
    title: String,
    url: String,
    type: String,
  }],
}, {
  timestamps: true,
});

// Index for efficient queries
sessionSchema.index({ batchId: 1, date: 1 });
sessionSchema.index({ facultyId: 1, status: 1 });
sessionSchema.index({ date: 1, status: 1 });

module.exports = mongoose.model('Session', sessionSchema);