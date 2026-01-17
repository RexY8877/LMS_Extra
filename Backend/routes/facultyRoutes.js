const express = require('express');
const router = express.Router();
const { getFacultyDashboard } = require('../controllers/facultyController');
const { protect } = require('../middleware/authMiddleware');

router.get('/dashboard', protect, getFacultyDashboard);

module.exports = router;
