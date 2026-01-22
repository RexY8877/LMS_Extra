const mongoose = require('mongoose');

const studentDataSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  skillReadiness: {
    type: Number,
  },
  codingProgress: {
    type: Number,
  },
  softSkillsProgress: {
    type: Number,
  },
  behavioralScore: {
    type: Number,
  },
  upcomingAssessments: {
    type: mongoose.Schema.Types.Mixed,
    default: [],
  },
  recentActivities: {
    type: mongoose.Schema.Types.Mixed,
    default: [],
  },
  aiRecommendations: {
    type: mongoose.Schema.Types.Mixed,
    default: [],
  },
  skillBreakdown: {
    type: mongoose.Schema.Types.Mixed,
    default: [],
  },
  weeklyProgress: {
    type: mongoose.Schema.Types.Mixed,
    default: [],
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('StudentData', studentDataSchema);
