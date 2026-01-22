const express = require('express');
const router = express.Router();
const { getFacultyDashboard, getFacultyStudents } = require('../controllers/facultyController');
const { protect } = require('../middleware/authMiddleware');

router.get('/dashboard', protect, getFacultyDashboard);
router.get('/students', protect, getFacultyStudents);

module.exports = router;
