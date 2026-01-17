const express = require('express');
const router = express.Router();
const {
  getSubmissionHistory,
  getSubmissionById,
  getUserStats,
} = require('../controllers/submissionController');

// Submission routes
router.get('/user/:userId/stats', getUserStats);
router.get('/user/:userId/problem/:problemId', getSubmissionHistory);
router.get('/:id', getSubmissionById);

module.exports = router;
