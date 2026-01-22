const express = require('express');
const {
  getStudentDashboard,
  getFacultyDashboard,
  getCollegeAnalytics,
  getPlatformAnalytics,
  getCodingProblems,
  getCodingProblem,
  getLeaderboard,
  submitCode,
} = require('../controllers/demoDataController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Student routes
router.get('/student/dashboard', protect, getStudentDashboard);

// Faculty routes
router.get('/faculty/dashboard', protect, getFacultyDashboard);

// College Admin routes
router.get('/college/analytics', protect, getCollegeAnalytics);

// Super Admin routes
router.get('/platform/analytics', protect, getPlatformAnalytics);

// Coding practice routes
router.get('/coding/problems', protect, getCodingProblems);
router.get('/coding/problems/:id', protect, getCodingProblem);
router.post('/coding/submit', protect, submitCode);

// Leaderboard
router.get('/leaderboard', protect, getLeaderboard);

module.exports = router;