const mongoose = require('mongoose');

const platformDataSchema = new mongoose.Schema({
  totalColleges: {
    type: Number,
  },
  totalStudents: {
    type: Number,
  },
  totalFaculty: {
    type: Number,
  },
  platformUsage: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  collegeComparison: {
    type: mongoose.Schema.Types.Mixed,
    default: [],
  },
  growthMetrics: {
    type: mongoose.Schema.Types.Mixed,
    default: [],
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('PlatformData', platformDataSchema);
