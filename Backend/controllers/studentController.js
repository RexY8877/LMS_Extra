const StudentData = require('../models/StudentData');
const CodingProblem = require('../models/CodingProblem');
const Leaderboard = require('../models/Leaderboard');

// @desc    Get student dashboard data
// @route   GET /api/student/dashboard
// @access  Private (Student)
const getStudentDashboard = async (req, res) => {
  try {
    const data = await StudentData.findOne({ where: { userId: req.user.id } });
    
    if (data) {
      res.json(data);
    } else {
      res.status(404).json({ message: 'Student data not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get coding problems
// @route   GET /api/student/problems
// @access  Private
const getCodingProblems = async (req, res) => {
  try {
    const problems = await CodingProblem.findAll();
    res.json(problems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get leaderboard
// @route   GET /api/student/leaderboard
// @access  Private
const getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await Leaderboard.findAll({
      order: [['score', 'DESC']],
      limit: 10,
    });
    
    // Add rank
    const rankedLeaderboard = leaderboard.map((entry, index) => ({
      ...entry.toJSON(),
      rank: index + 1,
    }));

    res.json(rankedLeaderboard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get learning path
// @route   GET /api/student/learning-path
// @access  Private
const getLearningPath = async (req, res) => {
  try {
    const data = await StudentData.findOne({ where: { userId: req.user.id } });
    
    if (data) {
      // Combine aiRecommendations and upcomingAssessments for the learning path
      const learningPath = {
        recommendations: data.aiRecommendations || [],
        assessments: data.upcomingAssessments || [],
        skillGap: data.skillBreakdown || []
      };
      res.json(learningPath);
    } else {
      res.status(404).json({ message: 'Student data not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getStudentDashboard, getCodingProblems, getLeaderboard, getLearningPath };
