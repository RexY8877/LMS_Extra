const express = require('express');
const router = express.Router();
const {
  runCode,
  submitCode,
} = require('../controllers/executionController');

// Execution routes
router.post('/run', runCode);
router.post('/submit', submitCode);

module.exports = router;
