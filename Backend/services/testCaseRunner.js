const executionService = require('./executionService');
const compareOutputs = require('../utils/compareOutputs');
const TestCase = require('../models/TestCase');
const CodingProblem = require('../models/CodingProblem');

/**
 * Test case runner service for executing code against test cases
 */
class TestCaseRunner {
  /**
   * Run code against test cases
   * @param {string} code - The code to execute
   * @param {string} language - Programming language
   * @param {string} problemId - Problem ID
   * @param {string} mode - 'run' for example tests only, 'submit' for all tests
   * @returns {Promise<Object>} Results with status, testResults, and metrics
   */
  async runTests(code, language, problemId, mode = 'run') {
    // Load problem to get time and memory limits
    const problem = await CodingProblem.findByPk(problemId);
    if (!problem) {
      throw new Error('Problem not found');
    }

    // Load test cases
    const testCases = await this.loadTestCases(problemId, mode);
    
    if (testCases.length === 0) {
      throw new Error('No test cases found for this problem');
    }

    // Execute code against each test case
    const results = await this.executeTestCases(
      code,
      language,
      testCases,
      problem.timeLimit,
      problem.memoryLimit,
      mode === 'submit' // stopOnFailure for submissions
    );

    // Determine overall status
    const status = this.determineStatus(results);

    // Calculate metrics
    const metrics = this.calculateMetrics(results);

    return {
      status,
      testResults: results,
      metrics,
      testsPassed: results.filter(r => r.passed).length,
      totalTests: results.length,
    };
  }

  /**
   * Load test cases for a problem
   * @param {string} problemId - Problem ID
   * @param {string} mode - 'run' for examples only, 'submit' for all
   * @returns {Promise<Array>} Array of test cases
   */
  async loadTestCases(problemId, mode) {
    const where = { problemId };
    
    // For 'run' mode, only load example test cases
    if (mode === 'run') {
      where.isExample = true;
    }

    const testCases = await TestCase.findAll({
      where,
      order: [['createdAt', 'ASC']],
    });

    return testCases;
  }

  /**
   * Execute code against test cases
   * @param {string} code - The code to execute
   * @param {string} language - Programming language
   * @param {Array} testCases - Test cases to run
   * @param {number} timeLimit - Time limit in milliseconds
   * @param {number} memoryLimit - Memory limit in MB
   * @param {boolean} stopOnFailure - Stop execution on first failure
   * @returns {Promise<Array>} Array of test results
   */
  async executeTestCases(code, language, testCases, timeLimit, memoryLimit, stopOnFailure) {
    const results = [];

    for (const testCase of testCases) {
      try {
        // Execute code with test case input
        const execution = await executionService.executeCode(
          code,
          language,
          testCase.input,
          timeLimit,
          memoryLimit
        );

        // Check if execution had errors
        if (execution.status === 'Time Limit Exceeded') {
          results.push({
            testCaseId: testCase.id,
            passed: false,
            input: testCase.input,
            expectedOutput: testCase.expectedOutput,
            actualOutput: '',
            runtime: execution.runtime,
            memory: execution.memory,
            error: 'Time Limit Exceeded',
            status: 'Time Limit Exceeded',
          });
          
          // Stop on first failure for submissions
          if (stopOnFailure) {
            break;
          }
          continue;
        }

        if (execution.status === 'Memory Limit Exceeded') {
          results.push({
            testCaseId: testCase.id,
            passed: false,
            input: testCase.input,
            expectedOutput: testCase.expectedOutput,
            actualOutput: '',
            runtime: execution.runtime,
            memory: execution.memory,
            error: 'Memory Limit Exceeded',
            status: 'Memory Limit Exceeded',
          });
          
          // Stop on first failure for submissions
          if (stopOnFailure) {
            break;
          }
          continue;
        }

        if (execution.status === 'Runtime Error') {
          results.push({
            testCaseId: testCase.id,
            passed: false,
            input: testCase.input,
            expectedOutput: testCase.expectedOutput,
            actualOutput: execution.stdout,
            runtime: execution.runtime,
            memory: execution.memory,
            error: execution.stderr || 'Runtime Error',
            status: 'Runtime Error',
          });
          
          // Stop on first failure for submissions
          if (stopOnFailure) {
            break;
          }
          continue;
        }

        // Compare output
        const passed = compareOutputs(testCase.expectedOutput, execution.stdout);

        results.push({
          testCaseId: testCase.id,
          passed,
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
          actualOutput: execution.stdout,
          runtime: execution.runtime,
          memory: execution.memory,
          error: passed ? null : 'Wrong Answer',
          status: passed ? 'Passed' : 'Wrong Answer',
        });

        // Stop on first failure for submissions
        if (!passed && stopOnFailure) {
          break;
        }
      } catch (error) {
        results.push({
          testCaseId: testCase.id,
          passed: false,
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
          actualOutput: '',
          runtime: 0,
          memory: 0,
          error: error.message,
          status: 'Runtime Error',
        });

        // Stop on first failure for submissions
        if (stopOnFailure) {
          break;
        }
      }
    }

    return results;
  }

  /**
   * Determine overall submission status
   * @param {Array} results - Test results
   * @returns {string} Overall status
   */
  determineStatus(results) {
    if (results.length === 0) {
      return 'No Tests';
    }

    // Check for specific error statuses
    const hasTimeLimit = results.some(r => r.status === 'Time Limit Exceeded');
    if (hasTimeLimit) {
      return 'Time Limit Exceeded';
    }

    const hasMemoryLimit = results.some(r => r.status === 'Memory Limit Exceeded');
    if (hasMemoryLimit) {
      return 'Memory Limit Exceeded';
    }

    const hasRuntimeError = results.some(r => r.status === 'Runtime Error');
    if (hasRuntimeError) {
      return 'Runtime Error';
    }

    // Check if all tests passed
    const allPassed = results.every(r => r.passed);
    if (allPassed) {
      return 'Accepted';
    }

    return 'Wrong Answer';
  }

  /**
   * Calculate execution metrics
   * @param {Array} results - Test results
   * @returns {Object} Metrics with average runtime and memory
   */
  calculateMetrics(results) {
    if (results.length === 0) {
      return {
        avgRuntime: 0,
        maxRuntime: 0,
        avgMemory: 0,
        maxMemory: 0,
      };
    }

    const runtimes = results.map(r => r.runtime);
    const memories = results.map(r => r.memory);

    return {
      avgRuntime: Math.round(runtimes.reduce((a, b) => a + b, 0) / runtimes.length),
      maxRuntime: Math.max(...runtimes),
      avgMemory: memories.reduce((a, b) => a + b, 0) / memories.length,
      maxMemory: Math.max(...memories),
    };
  }
}

module.exports = new TestCaseRunner();
