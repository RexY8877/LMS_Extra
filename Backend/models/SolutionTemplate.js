const mongoose = require('mongoose');

const solutionTemplateSchema = new mongoose.Schema({
  problemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CodingProblem',
    required: true,
  },
  language: {
    type: String,
    required: true,
  },
  template: {
    type: String,
    required: true,
  },
  functionSignature: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('SolutionTemplate', solutionTemplateSchema);
