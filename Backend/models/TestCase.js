const mongoose = require('mongoose');

const testCaseSchema = new mongoose.Schema({
  problemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CodingProblem',
    required: true,
  },
  input: {
    type: String,
    required: true,
  },
  expectedOutput: {
    type: String,
    required: true,
  },
  isExample: {
    type: Boolean,
    default: false,
  },
  weight: {
    type: Number,
    default: 1.0,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('TestCase', testCaseSchema);
