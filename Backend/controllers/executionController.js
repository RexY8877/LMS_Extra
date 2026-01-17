const CodingProblem = require('../models/CodingProblem');
const TestCase = require('../models/TestCase');
const Submission = require('../models/Submission');
const StudentProgress = require('../models/StudentProgress');
const { runTestCases } = require('../services/testCaseRunner');
const { updateStudentProgress } = require('../services/progressService');

/**
 * @route   POST /api/execute/run
 * @desc    Run code against example test cases only
 * @access  Public (should be protected in production)
 */
const runCode = async (req, res) => {
  try {
    const { problemId, code, language } = req.body;

    // Validate input
    if (!problemId || !code || !language) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: problemId, code, language',
      });
    }

    // Fetch problem to get time and memory limits
    const problem = await CodingProblem.findByPk(problemId);
    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found',
      });
    }

    // Fetch only example test cases
    const testCases = await TestCase.findAll({
      where: {
        problemId,
        isExample: true,
      },
    });

    if (testCases.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No example test cases found for this problem',
      });
    }

    // Run code against example test cases
    const results = await runTestCases({
      code,
      language,
      testCases,
      timeLimit: problem.timeLimit,
      memoryLimit: problem.memoryLimit,
      isSubmission: false, // Don't stop at first failure for run
    });

    // Return results
    return res.status(200).json({
      success: true,
      results: results.map(result => ({
        testCaseId: result.testCaseId,
        passed: result.passed,
        input: result.input,
        expectedOutput: result.expectedOutput,
        actualOutput: result.actualOutput,
        runtime: result.runtime,
        memory: result.memory,
        error: result.error,
      })),
      status: results.every(r => r.passed) ? 'All tests passed' : 'Some tests failed',
    });
  } catch (error) {
    console.error('Error running code:', error);
    return res.status(500).json({
      success: false,
      message: 'Error executing code',
      error: error.message,
    });
  }
};

/**
 * @route   POST /api/execute/submit
 * @desc    Submit code for full evaluation against all test cases
 * @access  Public (should be protected in production)
 */
const submitCode = async (req, res) => {
  try {
    const { problemId, code, language, userId } = req.body;

    // Validate input
    if (!problemId || !code || !language || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: problemId, code, language, userId',
      });
    }

    // Fetch problem to get time and memory limits
    const problem = await CodingProblem.findByPk(problemId);
    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found',
      });
    }

    // Fetch all test cases (example and hidden)
    const testCases = await TestCase.findAll({
      where: {
        problemId,
      },
    });

    if (testCases.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No test cases found for this problem',
      });
    }

    // Run code against all test cases
    const results = await runTestCases({
      code,
      language,
      testCases,
      timeLimit: problem.timeLimit,
      memoryLimit: problem.memoryLimit,
      isSubmission: true, // Stop at first failure
    });

    // Determine submission status
    let status = 'Accepted';
    let testsPassed = 0;
    let firstFailure = null;

    for (const result of results) {
      if (result.passed) {
        testsPassed++;
      } else {
        if (!firstFailure) {
          firstFailure = result;
        }
        if (result.error) {
          if (result.error.includes('Time Limit Exceeded')) {
            status = 'Time Limit Exceeded';
          } else if (result.error.includes('Memory Limit Exceeded')) {
            status = 'Memory Limit Exceeded';
          } else if (result.error.includes('Runtime Error')) {
            status = 'Runtime Error';
          } else if (result.error.includes('Compilation Error')) {
            status = 'Compilation Error';
          } else {
            status = 'Wrong Answer';
          }
        } else {
          status = 'Wrong Answer';
        }
        break; // Stop at first failure
      }
    }

    // Calculate runtime and memory statistics
    const successfulResults = results.filter(r => r.passed && r.runtime && r.memory);
    const avgRuntime = successfulResults.length > 0
      ? successfulResults.reduce((sum, r) => sum + r.runtime, 0) / successfulResults.length
      : 0;
    const avgMemory = successfulResults.length > 0
      ? successfulResults.reduce((sum, r) => sum + r.memory, 0) / successfulResults.length
      : 0;

    // Calculate percentiles (simplified - would need all submissions for accurate percentiles)
    // For now, we'll use placeholder values
    const runtimePercentile = 50.0;
    const memoryPercentile = 50.0;

    // Save submission to database
    const submission = await Submission.create({
      userId,
      problemId,
      code,
      language,
      status,
      runtime: avgRuntime,
      memory: avgMemory,
      runtimePercentile,
      memoryPercentile,
      testsPassed,
      totalTests: testCases.length,
      testResults: results.map(result => ({
        testCaseId: result.testCaseId,
        passed: result.passed,
        input: result.isExample ? result.input : undefined,
        expectedOutput: result.isExample ? result.expectedOutput : undefined,
        actualOutput: result.isExample ? result.actualOutput : undefined,
        runtime: result.runtime,
        memory: result.memory,
        error: result.error,
      })),
    });

    // Update student progress if accepted
    if (status === 'Accepted') {
      await updateStudentProgress(userId, problem, submission.id);
    }

    // Return submission results
    return res.status(200).json({
      success: true,
      submissionId: submission.id,
      status,
      testsPassed,
      totalTests: testCases.length,
      runtime: avgRuntime,
      memory: avgMemory,
      runtimePercentile,
      memoryPercentile,
      results: results.map(result => ({
        testCaseId: result.testCaseId,
        passed: result.passed,
        input: result.isExample ? result.input : undefined, // Only show input for example test cases
        expectedOutput: result.isExample ? result.expectedOutput : undefined,
        actualOutput: result.isExample ? result.actualOutput : undefined,
        runtime: result.runtime,
        memory: result.memory,
        error: result.error,
      })),
      firstFailure: firstFailure ? {
        input: firstFailure.isExample ? firstFailure.input : 'Hidden test case',
        expectedOutput: firstFailure.isExample ? firstFailure.expectedOutput : 'Hidden',
        actualOutput: firstFailure.isExample ? firstFailure.actualOutput : 'Hidden',
        error: firstFailure.error,
      } : null,
    });
  } catch (error) {
    console.error('Error submitting code:', error);
    return res.status(500).json({
      success: false,
      message: 'Error submitting code',
      error: error.message,
    });
  }
};

module.exports = {
  runCode,
  submitCode,
};
