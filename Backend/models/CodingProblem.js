const mongoose = require('mongoose');

const codingProblemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  constraints: {
    type: [String],
    default: [],
  },
  examples: {
    type: mongoose.Schema.Types.Mixed,
    default: [],
  },
  hints: {
    type: [String],
    default: [],
  },
  tags: {
    type: [String],
    default: [],
  },
  companies: {
    type: [String],
    default: [],
  },
  acceptance: {
    type: Number,
  },
  timeLimit: {
    type: Number,
    required: true,
    default: 2000,
  },
  memoryLimit: {
    type: Number,
    required: true,
    default: 256,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('CodingProblem', codingProblemSchema);
