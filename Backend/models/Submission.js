const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  problemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CodingProblem',
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  language: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: [
      'Accepted',
      'Wrong Answer',
      'Time Limit Exceeded',
      'Memory Limit Exceeded',
      'Runtime Error',
      'Compilation Error'
    ],
    required: true,
  },
  runtime: {
    type: Number,
  },
  memory: {
    type: Number,
  },
  runtimePercentile: {
    type: Number,
  },
  memoryPercentile: {
    type: Number,
  },
  testsPassed: {
    type: Number,
    default: 0,
  },
  totalTests: {
    type: Number,
    required: true,
  },
  testResults: {
    type: mongoose.Schema.Types.Mixed,
    default: [],
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Submission', submissionSchema);
