const PlatformData = require('../models/PlatformData');

// @desc    Get super admin dashboard data
// @route   GET /api/super-admin/dashboard
// @access  Private (Super Admin)
const getSuperAdminDashboard = async (req, res) => {
  try {
    const data = await PlatformData.findOne();
    if (data) {
      res.json(data);
    } else {
      res.status(404).json({ message: 'Platform data not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getSuperAdminDashboard };
