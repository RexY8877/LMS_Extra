const FacultyData = require('../models/FacultyData');

// @desc    Get faculty dashboard data
// @route   GET /api/faculty/dashboard
// @access  Private (Faculty)
const getFacultyDashboard = async (req, res) => {
  try {
    const data = await FacultyData.findOne({ where: { userId: req.user.id } });
    if (data) {
      res.json(data);
    } else {
      res.status(404).json({ message: 'Faculty data not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getFacultyDashboard };
