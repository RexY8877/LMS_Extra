const express = require('express');
const router = express.Router();
const { getSuperAdminDashboard } = require('../controllers/superAdminController');
const { protect, superAdmin } = require('../middleware/authMiddleware');

router.get('/dashboard', protect, superAdmin, getSuperAdminDashboard);

module.exports = router;
