const CollegeData = require('../models/CollegeData');

// @desc    Get college admin dashboard data
// @route   GET /api/admin/dashboard
// @access  Private (College Admin)
const getAdminDashboard = async (req, res) => {
  try {
    const data = await CollegeData.findOne({ where: { collegeName: req.user.college } });
    if (data) {
      res.json(data);
    } else {
      res.status(404).json({ message: 'College data not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAdminDashboard };
