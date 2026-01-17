const StudentProgress = require('../models/StudentProgress');
const Submission = require('../models/Submission');
const CodingProblem = require('../models/CodingProblem');
const { Op } = require('sequelize');

/**
 * Update student progress after solving a problem
 * @param {string} userId - User ID
 * @param {object} problem - Problem object with difficulty and tags
 * @param {string} currentSubmissionId - ID of the current submission to exclude from previous submission check
 * @returns {Promise<object>} Updated progress
 */
async function updateStudentProgress(userId, problem, currentSubmissionId = null) {
  try {
    // Get or create student progress record
    let progress = await StudentProgress.findOne({ where: { userId } });
    
    if (!progress) {
      progress = await StudentProgress.create({ userId });
    }

    // Check if problem was previously solved by user (excluding current submission)
    const whereClause = {
      userId,
      problemId: problem.id,
      status: 'Accepted',
    };
    
    // Exclude the current submission from the check
    if (currentSubmissionId) {
      whereClause.id = { [Op.ne]: currentSubmissionId };
    }

    const previousAcceptedSubmission = await Submission.findOne({
      where: whereClause,
      order: [['createdAt', 'ASC']],
    });

    const isFirstSolve = !previousAcceptedSubmission;

    if (isFirstSolve) {
      // Update total solved count
      progress.totalSolved += 1;

      // Update difficulty-specific count
      if (problem.difficulty === 'Easy') {
        progress.easySolved += 1;
      } else if (problem.difficulty === 'Medium') {
        progress.mediumSolved += 1;
      } else if (problem.difficulty === 'Hard') {
        progress.hardSolved += 1;
      }

      // Update topic-based progress for each problem tag
      const solvedByTopic = { ...progress.solvedByTopic };
      if (problem.tags && Array.isArray(problem.tags)) {
        for (const tag of problem.tags) {
          // Use Object.prototype.hasOwnProperty to avoid prototype pollution
          const currentCount = Object.prototype.hasOwnProperty.call(solvedByTopic, tag) 
            ? solvedByTopic[tag] 
            : 0;
          solvedByTopic[tag] = currentCount + 1;
        }
      }
      progress.solvedByTopic = solvedByTopic;

      // Update daily activity map for current date
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      const dailyActivity = { ...progress.dailyActivity };
      dailyActivity[today] = (dailyActivity[today] || 0) + 1;
      progress.dailyActivity = dailyActivity;

      // Recalculate streak based on consecutive days
      progress.streak = calculateStreak(dailyActivity, today);
      progress.lastSolvedAt = new Date();
    }

    // Update total submissions and acceptance rate
    const totalSubmissions = await Submission.count({
      where: { userId },
    });
    const acceptedSubmissions = await Submission.count({
      where: { userId, status: 'Accepted' },
    });

    progress.totalSubmissions = totalSubmissions;
    progress.acceptedSubmissions = acceptedSubmissions;
    progress.acceptanceRate = totalSubmissions > 0 
      ? (acceptedSubmissions / totalSubmissions) * 100 
      : 0;

    await progress.save();

    return progress;
  } catch (error) {
    console.error('Error updating student progress:', error);
    throw error;
  }
}

/**
 * Calculate streak based on consecutive days of activity
 * @param {object} dailyActivity - Map of date -> problems solved
 * @param {string} today - Today's date in YYYY-MM-DD format
 * @returns {number} Current streak
 */
function calculateStreak(dailyActivity, today) {
  const dates = Object.keys(dailyActivity).sort().reverse();
  
  if (dates.length === 0) {
    return 0;
  }

  let streak = 0;
  let currentDate = new Date(today);

  for (let i = 0; i < dates.length; i++) {
    const dateStr = currentDate.toISOString().split('T')[0];
    
    if (dailyActivity[dateStr] && dailyActivity[dateStr] > 0) {
      streak++;
      // Move to previous day
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

module.exports = {
  updateStudentProgress,
  calculateStreak,
};
