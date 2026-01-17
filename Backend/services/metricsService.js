const Submission = require('../models/Submission');
const { Op } = require('sequelize');

/**
 * Calculate percentile ranking for a submission's runtime or memory
 * @param {string} problemId - The problem ID
 * @param {number} value - The runtime or memory value to rank
 * @param {string} metric - Either 'runtime' or 'memory'
 * @returns {Promise<number>} - Percentile ranking (0-100)
 */
async function calculatePercentile(problemId, value, metric) {
  if (!problemId || value === null || value === undefined) {
    return null;
  }

  if (metric !== 'runtime' && metric !== 'memory') {
    throw new Error('Metric must be either "runtime" or "memory"');
  }

  // Fetch all accepted submissions for this problem
  const acceptedSubmissions = await Submission.findAll({
    where: {
      problemId,
      status: 'Accepted',
      [metric]: {
        [Op.not]: null
      }
    },
    attributes: [metric],
    order: [[metric, 'ASC']]
  });

  if (acceptedSubmissions.length === 0) {
    return null;
  }

  // Count how many submissions have a value less than or equal to the given value
  const countBelowOrEqual = acceptedSubmissions.filter(
    sub => sub[metric] <= value
  ).length;

  // Calculate percentile: (count below or equal / total count) * 100
  const percentile = (countBelowOrEqual / acceptedSubmissions.length) * 100;

  return Math.round(percentile * 100) / 100; // Round to 2 decimal places
}

/**
 * Calculate both runtime and memory percentiles for a submission
 * @param {string} problemId - The problem ID
 * @param {number} runtime - The runtime value
 * @param {number} memory - The memory value
 * @returns {Promise<{runtimePercentile: number, memoryPercentile: number}>}
 */
async function calculatePercentiles(problemId, runtime, memory) {
  const runtimePercentile = await calculatePercentile(problemId, runtime, 'runtime');
  const memoryPercentile = await calculatePercentile(problemId, memory, 'memory');

  return {
    runtimePercentile,
    memoryPercentile
  };
}

module.exports = {
  calculatePercentile,
  calculatePercentiles
};
