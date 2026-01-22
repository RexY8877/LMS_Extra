const express = require('express');
const router = express.Router();
const {
  getContentStatus,
  getProcessingStatistics,
  retryContentProcessing,
  getContent,
  updateContent,
  deleteContent
} = require('../controllers/contentController');
const { authenticateToken } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authenticateToken);

// Content management routes
router.get('/:id', getContent);
router.put('/:id', updateContent);
router.delete('/:id', deleteContent);

// Video processing status routes
router.get('/:id/status', getContentStatus);
router.post('/:id/retry', retryContentProcessing);

// Processing statistics (admin/faculty only)
router.get('/processing/stats', getProcessingStatistics);

module.exports = router;