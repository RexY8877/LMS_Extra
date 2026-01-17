const Submission = require('../models/Submission');
const StudentProgress = require('../models/StudentProgress');
const { Op } = require('sequelize');

/**
 * @route   GET /api/submissions/user/:userId/problem/:problemId
 * @desc    Get submission history for a user and problem
 * @access  Public (should be protected in production)
 */
const getSubmissionHistory = async (req, res) => {
  try {
    const { userId, problemId } = req.params;
    const { status } = req.query;

    // Build where clause
    const whereClause = {
      userId,
      problemId,
    };

    // Add status filter if provided
    if (status) {
      whereClause.status = status;
    }

    // Fetch submissions ordered by timestamp descending
    const submissions = await Submission.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      attributes: [
        'id',
        'status',
        'runtime',
        'memory',
        'runtimePercentile',
        'memoryPercentile',
        'testsPassed',
        'totalTests',
        'language',
        'createdAt',
      ],
    });

    return res.status(200).json({
      success: true,
      count: submissions.length,
      submissions,
    });
  } catch (error) {
    console.error('Error fetching submission history:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching submission history',
      error: error.message,
    });
  }
};

/**
 * @route   GET /api/submissions/:id
 * @desc    Get detailed submission information
 * @access  Public (should be protected in production)
 */
const getSubmissionById = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch submission with all details
    const submission = await Submission.findByPk(id);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found',
      });
    }

    return res.status(200).json({
      success: true,
      submission: {
        id: submission.id,
        userId: submission.userId,
        problemId: submission.problemId,
        code: submission.code,
        language: submission.language,
        status: submission.status,
        runtime: submission.runtime,
        memory: submission.memory,
        runtimePercentile: submission.runtimePercentile,
        memoryPercentile: submission.memoryPercentile,
        testsPassed: submission.testsPassed,
        totalTests: submission.totalTests,
        testResults: submission.testResults || [],
        createdAt: submission.createdAt,
        updatedAt: submission.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error fetching submission:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching submission',
      error: error.message,
    });
  }
};

/**
 * @route   GET /api/submissions/user/:userId/stats
 * @desc    Get user's coding statistics and progress
 * @access  Public (should be protected in production)
 */
const getUserStats = async (req, res) => {
  try {
    const { userId } = req.params;

    // Get student progress record
    const progress = await StudentProgress.findOne({
      where: { userId },
    });

    if (!progress) {
      // Return default stats if no progress exists
      return res.status(200).json({
        success: true,
        stats: {
          totalSolved: 0,
          easySolved: 0,
          mediumSolved: 0,
          hardSolved: 0,
          totalSubmissions: 0,
          acceptedSubmissions: 0,
          acceptanceRate: 0,
          solvedByTopic: {},
          dailyActivity: {},
          streak: 0,
          lastSolvedAt: null,
        },
      });
    }

    // Return progress statistics
    return res.status(200).json({
      success: true,
      stats: {
        totalSolved: progress.totalSolved,
        easySolved: progress.easySolved,
        mediumSolved: progress.mediumSolved,
        hardSolved: progress.hardSolved,
        totalSubmissions: progress.totalSubmissions,
        acceptedSubmissions: progress.acceptedSubmissions,
        acceptanceRate: progress.acceptanceRate,
        solvedByTopic: progress.solvedByTopic,
        dailyActivity: progress.dailyActivity,
        streak: progress.streak,
        lastSolvedAt: progress.lastSolvedAt,
      },
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching user statistics',
      error: error.message,
    });
  }
};

module.exports = {
  getSubmissionHistory,
  getSubmissionById,
  getUserStats,
};
