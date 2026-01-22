const mongoose = require('mongoose');

const collegeDataSchema = new mongoose.Schema({
  collegeName: {
    type: String,
    required: true,
    unique: true,
  },
  totalStudents: {
    type: Number,
  },
  activeStudents: {
    type: Number,
  },
  placementReady: {
    type: Number,
  },
  averageScore: {
    type: Number,
  },
  batchWiseData: {
    type: mongoose.Schema.Types.Mixed,
    default: [],
  },
  skillHeatmap: {
    type: mongoose.Schema.Types.Mixed,
    default: [],
  },
  highRiskStudents: {
    type: mongoose.Schema.Types.Mixed,
    default: [],
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('CollegeData', collegeDataSchema);
