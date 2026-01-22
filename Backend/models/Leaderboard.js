const mongoose = require('mongoose');

const leaderboardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  college: {
    type: String,
    required: true,
  },
  score: {
    type: Number,
    required: true,
  },
  badges: {
    type: Number,
    default: 0,
  },
  avatar: {
    type: String,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Leaderboard', leaderboardSchema);
