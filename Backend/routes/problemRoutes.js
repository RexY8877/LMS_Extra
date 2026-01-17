const express = require('express');
const router = express.Router();
const {
  getProblems,
  getProblemById,
  getProblemTemplate,
  getProblemStats
} = require('../controllers/problemController');

// Problem routes
router.get('/', getProblems);
router.get('/:id', getProblemById);
router.get('/:id/template', getProblemTemplate);
router.get('/:id/stats', getProblemStats);

module.exports = router;
