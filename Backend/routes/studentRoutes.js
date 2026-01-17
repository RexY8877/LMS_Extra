const express = require('express');
const router = express.Router();
const {
  getStudentDashboard,
  getCodingProblems,
  getLeaderboard,
  getLearningPath,
} = require('../controllers/studentController');
const { protect } = require('../middleware/authMiddleware');

router.get('/dashboard', protect, getStudentDashboard);
router.get('/problems', protect, getCodingProblems);
router.get('/leaderboard', protect, getLeaderboard);
router.get('/learning-path', protect, getLearningPath);

module.exports = router;
