const fc = require('fast-check');

// Mock dependencies before requiring the controller
jest.mock('../models/CodingProblem', () => ({
  findByPk: jest.fn(),
}));
jest.mock('../models/TestCase', () => ({
  findAll: jest.fn(),
}));
jest.mock('../models/Submission', () => ({
  create: jest.fn(),
  findOne: jest.fn(),
  count: jest.fn(),
}));
jest.mock('../models/StudentProgress', () => ({
  findOne: jest.fn(),
  create: jest.fn(),
}));
jest.mock('../services/testCaseRunner', () => ({
  runTestCases: jest.fn(),
}));

const { runCode, submitCode } = require('./executionController');
const CodingProblem = require('../models/CodingProblem');
const TestCase = require('../models/TestCase');
const Submission = require('../models/Submission');
const StudentProgress = require('../models/StudentProgress');
const { runTestCases } = require('../services/testCaseRunner');

describe('Execution Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    
    // Clear all mocks
    jest.clearAllMocks();
    
    // Reset mock implementations
    CodingProblem.findByPk.mockReset();
    TestCase.findAll.mockReset();
    Submission.create.mockReset();
    Submission.findOne.mockReset();
    Submission.count.mockReset();
    StudentProgress.findOne.mockReset();
    StudentProgress.create.mockReset();
    runTestCases.mockReset();
  });

  describe('runCode', () => {
    /**
     * Feature: coding-practice-system, Property 9: Execution results include required output fields
     * Validates: Requirements 4.2
     */
    it('should include actual and expected outputs in all test results', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.uuid(),
          fc.string({ minLength: 10, maxLength: 100 }),
          fc.constantFrom('python', 'javascript', 'java'),
          fc.array(
            fc.record({
              id: fc.uuid(),
              input: fc.string(),
              expectedOutput: fc.string(),
              isExample: fc.constant(true),
            }),
            { minLength: 1, maxLength: 5 }
          ),
          async (problemId, code, language, testCaseData) => {
            // Setup mocks
            const problem = {
              id: problemId,
              timeLimit: 2000,
              memoryLimit: 256,
            };

            const testCases = testCaseData.map(tc => ({
              id: tc.id,
              problemId,
              input: tc.input,
              expectedOutput: tc.expectedOutput,
              isExample: tc.isExample,
            }));

            const mockResults = testCases.map(tc => ({
              testCaseId: tc.id,
              passed: true,
              input: tc.input,
              expectedOutput: tc.expectedOutput,
              actualOutput: tc.expectedOutput,
              runtime: 100,
              memory: 50,
              isExample: true,
            }));

            CodingProblem.findByPk.mockResolvedValue(problem);
            TestCase.findAll.mockResolvedValue(testCases);
            runTestCases.mockResolvedValue(mockResults);

            req.body = { problemId, code, language };

            await runCode(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalled();

            const response = res.json.mock.calls[0][0];
            expect(response.success).toBe(true);
            expect(response.results).toBeDefined();

            // Property: All results must include actualOutput and expectedOutput
            response.results.forEach(result => {
              expect(result).toHaveProperty('actualOutput');
              expect(result).toHaveProperty('expectedOutput');
              expect(result.actualOutput).toBeDefined();
              expect(result.expectedOutput).toBeDefined();
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Feature: coding-practice-system, Property 35: Execution completes within time bounds
     * Validates: Requirements 12.2
     */
    it('should return results within reasonable time for standard test cases', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.uuid(),
          fc.string({ minLength: 10, maxLength: 100 }),
          fc.constantFrom('python', 'javascript', 'java'),
          fc.array(
            fc.record({
              id: fc.uuid(),
              input: fc.string({ maxLength: 100 }),
              expectedOutput: fc.string({ maxLength: 100 }),
            }),
            { minLength: 1, maxLength: 3 }
          ),
          async (problemId, code, language, testCaseData) => {
            const problem = {
              id: problemId,
              timeLimit: 2000,
              memoryLimit: 256,
            };

            const testCases = testCaseData.map(tc => ({
              id: tc.id,
              problemId,
              input: tc.input,
              expectedOutput: tc.expectedOutput,
              isExample: true,
            }));

            const mockResults = testCases.map(tc => ({
              testCaseId: tc.id,
              passed: true,
              input: tc.input,
              expectedOutput: tc.expectedOutput,
              actualOutput: tc.expectedOutput,
              runtime: 100,
              memory: 50,
              isExample: true,
            }));

            CodingProblem.findByPk.mockResolvedValue(problem);
            TestCase.findAll.mockResolvedValue(testCases);
            runTestCases.mockResolvedValue(mockResults);

            req.body = { problemId, code, language };

            const startTime = Date.now();
            await runCode(req, res);
            const endTime = Date.now();
            const executionTime = endTime - startTime;

            // Property: Execution should complete within 3 seconds (3000ms)
            // Since we're mocking, this tests the controller overhead
            expect(executionTime).toBeLessThan(3000);
            expect(res.status).toHaveBeenCalledWith(200);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return 400 when required fields are missing', async () => {
      req.body = { problemId: 'test-id' }; // Missing code and language

      await runCode(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Missing required fields: problemId, code, language',
      });
    });

    it('should return 404 when problem is not found', async () => {
      CodingProblem.findByPk.mockResolvedValue(null);

      req.body = {
        problemId: 'non-existent-id',
        code: 'print("hello")',
        language: 'python',
      };

      await runCode(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Problem not found',
      });
    });

    it('should return 404 when no example test cases exist', async () => {
      const problem = {
        id: 'test-id',
        timeLimit: 2000,
        memoryLimit: 256,
      };

      CodingProblem.findByPk.mockResolvedValue(problem);
      TestCase.findAll.mockResolvedValue([]);

      req.body = {
        problemId: 'test-id',
        code: 'print("hello")',
        language: 'python',
      };

      await runCode(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'No example test cases found for this problem',
      });
    });
  });

  describe('submitCode', () => {
    /**
     * Feature: coding-practice-system, Property 14: All passing test cases result in accepted status
     * Validates: Requirements 5.2
     */
    it('should return Accepted status when all test cases pass', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1 }),
          fc.string({ minLength: 1 }),
          fc.string({ minLength: 10, maxLength: 100 }),
          fc.constantFrom('python', 'javascript', 'java'),
          fc.integer({ min: 1, max: 10 }),
          async (problemIdSuffix, userIdSuffix, code, language, numTestCases) => {
            // Reset mocks for each iteration
            jest.clearAllMocks();
            CodingProblem.findByPk.mockReset();
            TestCase.findAll.mockReset();
            Submission.create.mockReset();
            Submission.findOne.mockReset();
            Submission.count.mockReset();
            StudentProgress.findOne.mockReset();
            StudentProgress.create.mockReset();
            runTestCases.mockReset();
            
            const problemId = `problem-${problemIdSuffix}`;
            const userId = `user-${userIdSuffix}`;
            
            const problem = {
              id: problemId,
              timeLimit: 2000,
              memoryLimit: 256,
              difficulty: 'Easy',
            };

            // Generate unique test cases
            const testCases = Array.from({ length: numTestCases }, (_, i) => ({
              id: `tc-${problemIdSuffix}-${i}`,
              problemId,
              input: `input-${i}`,
              expectedOutput: `output-${i}`,
              isExample: i % 2 === 0,
            }));

            // All test cases pass
            const mockResults = testCases.map(tc => ({
              testCaseId: tc.id,
              passed: true,
              input: tc.input,
              expectedOutput: tc.expectedOutput,
              actualOutput: tc.expectedOutput,
              runtime: 100,
              memory: 50,
              isExample: tc.isExample,
            }));

            const mockSubmission = {
              id: 'submission-123',
              userId,
              problemId,
              code,
              language,
              status: 'Accepted',
              runtime: 100,
              memory: 50,
              runtimePercentile: 50.0,
              memoryPercentile: 50.0,
              testsPassed: numTestCases,
              totalTests: numTestCases,
            };

            const mockProgress = {
              id: 'progress-123',
              userId,
              totalSolved: 1,
              easySolved: 1,
              mediumSolved: 0,
              hardSolved: 0,
              totalSubmissions: 0,
              acceptedSubmissions: 0,
              acceptanceRate: 0,
              solvedByTopic: {},
              dailyActivity: {},
              streak: 0,
              save: jest.fn().mockResolvedValue(true),
            };

            CodingProblem.findByPk.mockResolvedValue(problem);
            TestCase.findAll.mockResolvedValue(testCases);
            runTestCases.mockResolvedValue(mockResults);
            Submission.create.mockResolvedValue(mockSubmission);
            Submission.findOne.mockResolvedValue(null);
            Submission.count.mockResolvedValue(1);
            StudentProgress.findOne.mockResolvedValue(mockProgress);

            req.body = { problemId, code, language, userId };

            await submitCode(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            const response = res.json.mock.calls[0][0];

            // Property: When all test cases pass, status must be Accepted
            expect(response.status).toBe('Accepted');
            expect(response.testsPassed).toBe(numTestCases);
            expect(response.totalTests).toBe(numTestCases);
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Feature: coding-practice-system, Property 15: Any failing test case results in wrong answer status
     * Validates: Requirements 5.3
     */
    it('should return Wrong Answer status when any test case fails', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1 }),
          fc.string({ minLength: 1 }),
          fc.string({ minLength: 10, maxLength: 100 }),
          fc.constantFrom('python', 'javascript', 'java'),
          fc.integer({ min: 2, max: 10 }),
          fc.integer({ min: 0, max: 9 }),
          async (problemIdSuffix, userIdSuffix, code, language, numTestCases, failIndexRaw) => {
            // Reset mocks for each iteration
            jest.clearAllMocks();
            CodingProblem.findByPk.mockReset();
            TestCase.findAll.mockReset();
            Submission.create.mockReset();
            Submission.findOne.mockReset();
            Submission.count.mockReset();
            StudentProgress.findOne.mockReset();
            StudentProgress.create.mockReset();
            runTestCases.mockReset();
            
            const problemId = `problem-${problemIdSuffix}`;
            const userId = `user-${userIdSuffix}`;
            const failIndex = Math.min(failIndexRaw, numTestCases - 1);
            
            const problem = {
              id: problemId,
              timeLimit: 2000,
              memoryLimit: 256,
              difficulty: 'Easy',
            };

            // Generate unique test cases
            const testCases = Array.from({ length: numTestCases }, (_, i) => ({
              id: `tc-${problemIdSuffix}-${i}`,
              problemId,
              input: `input-${i}`,
              expectedOutput: `output-${i}`,
              isExample: i % 2 === 0,
            }));

            // Make one test case fail - only return results up to and including the failure
            const mockResults = Array.from({ length: failIndex + 1 }, (_, i) => ({
              testCaseId: testCases[i].id,
              passed: i !== failIndex,
              input: testCases[i].input,
              expectedOutput: testCases[i].expectedOutput,
              actualOutput: i === failIndex ? `wrong-output-${i}` : testCases[i].expectedOutput,
              runtime: 100,
              memory: 50,
              isExample: testCases[i].isExample,
            }));

            const mockSubmission = {
              id: 'submission-123',
              userId,
              problemId,
              code,
              language,
              status: 'Wrong Answer',
              runtime: 100,
              memory: 50,
              runtimePercentile: 50.0,
              memoryPercentile: 50.0,
              testsPassed: failIndex,
              totalTests: numTestCases,
            };

            const mockProgress = {
              id: 'progress-123',
              userId,
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
              save: jest.fn().mockResolvedValue(true),
            };

            CodingProblem.findByPk.mockResolvedValue(problem);
            TestCase.findAll.mockResolvedValue(testCases);
            runTestCases.mockResolvedValue(mockResults);
            Submission.create.mockResolvedValue(mockSubmission);
            Submission.findOne.mockResolvedValue(null);
            Submission.count.mockResolvedValue(1);
            StudentProgress.findOne.mockResolvedValue(mockProgress);

            req.body = { problemId, code, language, userId };

            await submitCode(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            const response = res.json.mock.calls[0][0];

            // Property: When any test case fails, status must not be Accepted
            expect(response.status).not.toBe('Accepted');
            expect(response.testsPassed).toBeLessThan(numTestCases);
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Feature: coding-practice-system, Property 16: Accepted submissions are persisted with complete data
     * Validates: Requirements 5.5
     */
    it('should persist accepted submissions with all required fields', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1 }),
          fc.string({ minLength: 1 }),
          fc.string({ minLength: 10, maxLength: 100 }),
          fc.constantFrom('python', 'javascript', 'java'),
          fc.integer({ min: 1, max: 5 }),
          async (problemIdSuffix, userIdSuffix, code, language, numTestCases) => {
            // Reset mocks for each iteration
            jest.clearAllMocks();
            CodingProblem.findByPk.mockReset();
            TestCase.findAll.mockReset();
            Submission.create.mockReset();
            Submission.findOne.mockReset();
            Submission.count.mockReset();
            StudentProgress.findOne.mockReset();
            StudentProgress.create.mockReset();
            runTestCases.mockReset();
            
            const problemId = `problem-${problemIdSuffix}`;
            const userId = `user-${userIdSuffix}`;
            
            const problem = {
              id: problemId,
              timeLimit: 2000,
              memoryLimit: 256,
              difficulty: 'Easy',
            };

            // Generate unique test cases
            const testCases = Array.from({ length: numTestCases }, (_, i) => ({
              id: `tc-${problemIdSuffix}-${i}`,
              problemId,
              input: `input-${i}`,
              expectedOutput: `output-${i}`,
              isExample: i % 2 === 0,
            }));

            const mockResults = testCases.map(tc => ({
              testCaseId: tc.id,
              passed: true,
              input: tc.input,
              expectedOutput: tc.expectedOutput,
              actualOutput: tc.expectedOutput,
              runtime: 100,
              memory: 50,
              isExample: tc.isExample,
            }));

            const mockSubmission = {
              id: 'submission-123',
              userId,
              problemId,
              code,
              language,
              status: 'Accepted',
              runtime: 100,
              memory: 50,
              runtimePercentile: 50.0,
              memoryPercentile: 50.0,
              testsPassed: numTestCases,
              totalTests: numTestCases,
            };

            const mockProgress = {
              id: 'progress-123',
              userId,
              totalSolved: 1,
              easySolved: 1,
              mediumSolved: 0,
              hardSolved: 0,
              totalSubmissions: 0,
              acceptedSubmissions: 0,
              acceptanceRate: 0,
              solvedByTopic: {},
              dailyActivity: {},
              streak: 0,
              save: jest.fn().mockResolvedValue(true),
            };

            CodingProblem.findByPk.mockResolvedValue(problem);
            TestCase.findAll.mockResolvedValue(testCases);
            runTestCases.mockResolvedValue(mockResults);
            Submission.create.mockResolvedValue(mockSubmission);
            Submission.findOne.mockResolvedValue(null);
            Submission.count.mockResolvedValue(1);
            StudentProgress.findOne.mockResolvedValue(mockProgress);

            req.body = { problemId, code, language, userId };

            await submitCode(req, res);

            // Property: Submission.create must be called with complete data
            expect(Submission.create).toHaveBeenCalled();
            const createCall = Submission.create.mock.calls[0][0];

            expect(createCall).toHaveProperty('userId');
            expect(createCall).toHaveProperty('problemId');
            expect(createCall).toHaveProperty('code');
            expect(createCall).toHaveProperty('language');
            expect(createCall).toHaveProperty('status');
            expect(createCall).toHaveProperty('runtime');
            expect(createCall).toHaveProperty('memory');
            expect(createCall).toHaveProperty('testsPassed');
            expect(createCall).toHaveProperty('totalTests');
            
            // Verify the values match what was passed in
            expect(createCall.userId).toBe(userId);
            expect(createCall.problemId).toBe(problemId);
            expect(createCall.code).toBe(code);
            expect(createCall.language).toBe(language);
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Feature: coding-practice-system, Property 19: Failed test cases capture complete diagnostic data
     * Validates: Requirements 6.3
     */
    it('should capture input, expected, and actual output for failed test cases', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.uuid(),
          fc.uuid(),
          fc.string({ minLength: 10, maxLength: 100 }),
          fc.constantFrom('python', 'javascript', 'java'),
          fc.array(
            fc.record({
              id: fc.uuid(),
              input: fc.string({ minLength: 1 }),
              expectedOutput: fc.string({ minLength: 1 }),
              actualOutput: fc.string({ minLength: 1 }),
              isExample: fc.constant(true), // Use example test cases for visibility
            }),
            { minLength: 1, maxLength: 5 }
          ),
          async (problemId, userId, code, language, testCaseData) => {
            const problem = {
              id: problemId,
              timeLimit: 2000,
              memoryLimit: 256,
              difficulty: 'Easy',
            };

            const testCases = testCaseData.map(tc => ({
              id: tc.id,
              problemId,
              input: tc.input,
              expectedOutput: tc.expectedOutput,
              isExample: tc.isExample,
            }));

            // First test case fails
            const mockResults = testCases.map((tc, idx) => ({
              testCaseId: tc.id,
              passed: idx !== 0,
              input: tc.input,
              expectedOutput: tc.expectedOutput,
              actualOutput: idx === 0 ? testCaseData[idx].actualOutput : tc.expectedOutput,
              runtime: 100,
              memory: 50,
              isExample: tc.isExample,
            }));

            // Only return first result (failure)
            const resultsUpToFailure = [mockResults[0]];

            const mockSubmission = {
              id: 'submission-123',
              userId,
              problemId,
              code,
              language,
              status: 'Wrong Answer',
              runtime: 100,
              memory: 50,
              runtimePercentile: 50.0,
              memoryPercentile: 50.0,
              testsPassed: 0,
              totalTests: testCases.length,
            };

            CodingProblem.findByPk.mockResolvedValue(problem);
            TestCase.findAll.mockResolvedValue(testCases);
            runTestCases.mockResolvedValue(resultsUpToFailure);
            Submission.create.mockResolvedValue(mockSubmission);
            Submission.findOne.mockResolvedValue(null);

            req.body = { problemId, code, language, userId };

            await submitCode(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            const response = res.json.mock.calls[0][0];

            // Property: Failed test cases must include diagnostic data
            expect(response.firstFailure).toBeDefined();
            expect(response.firstFailure).toHaveProperty('input');
            expect(response.firstFailure).toHaveProperty('expectedOutput');
            expect(response.firstFailure).toHaveProperty('actualOutput');
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Feature: coding-practice-system, Property 38: Test failures provide comparison data
     * Validates: Requirements 12.5
     */
    it('should provide expected and actual outputs for comparison when tests fail', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.uuid(),
          fc.uuid(),
          fc.string({ minLength: 10, maxLength: 100 }),
          fc.constantFrom('python', 'javascript', 'java'),
          fc.string({ minLength: 1 }),
          fc.string({ minLength: 1 }),
          fc.string({ minLength: 1 }),
          async (problemId, userId, code, language, input, expectedOutput, actualOutput) => {
            // Ensure they're different
            if (expectedOutput === actualOutput) {
              actualOutput = actualOutput + '_different';
            }

            const problem = {
              id: problemId,
              timeLimit: 2000,
              memoryLimit: 256,
              difficulty: 'Easy',
            };

            const testCases = [
              {
                id: 'tc-1',
                problemId,
                input,
                expectedOutput,
                isExample: true,
              },
            ];

            const mockResults = [
              {
                testCaseId: 'tc-1',
                passed: false,
                input,
                expectedOutput,
                actualOutput,
                runtime: 100,
                memory: 50,
                isExample: true,
              },
            ];

            const mockSubmission = {
              id: 'submission-123',
              userId,
              problemId,
              code,
              language,
              status: 'Wrong Answer',
              runtime: 100,
              memory: 50,
              runtimePercentile: 50.0,
              memoryPercentile: 50.0,
              testsPassed: 0,
              totalTests: 1,
            };

            CodingProblem.findByPk.mockResolvedValue(problem);
            TestCase.findAll.mockResolvedValue(testCases);
            runTestCases.mockResolvedValue(mockResults);
            Submission.create.mockResolvedValue(mockSubmission);
            Submission.findOne.mockResolvedValue(null);

            req.body = { problemId, code, language, userId };

            await submitCode(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            const response = res.json.mock.calls[0][0];

            // Property: Test failures must provide both expected and actual for comparison
            expect(response.firstFailure).toBeDefined();
            expect(response.firstFailure.expectedOutput).toBeDefined();
            expect(response.firstFailure.actualOutput).toBeDefined();
            expect(response.firstFailure.expectedOutput).not.toBe(response.firstFailure.actualOutput);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return 400 when required fields are missing', async () => {
      req.body = { problemId: 'test-id', code: 'test' }; // Missing language and userId

      await submitCode(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Missing required fields: problemId, code, language, userId',
      });
    });

    it('should return 404 when problem is not found', async () => {
      CodingProblem.findByPk.mockResolvedValue(null);

      req.body = {
        problemId: 'non-existent-id',
        code: 'print("hello")',
        language: 'python',
        userId: 'user-123',
      };

      await submitCode(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Problem not found',
      });
    });

    it('should create submission and return results for successful submission', async () => {
      const problemId = 'problem-123';
      const userId = 'user-123';
      const problem = {
        id: problemId,
        timeLimit: 2000,
        memoryLimit: 256,
        difficulty: 'Easy',
      };

      const testCases = [
        {
          id: 'tc-1',
          problemId,
          input: '1 2',
          expectedOutput: '3',
          isExample: true,
        },
        {
          id: 'tc-2',
          problemId,
          input: '5 7',
          expectedOutput: '12',
          isExample: false,
        },
      ];

      const mockResults = testCases.map(tc => ({
        testCaseId: tc.id,
        passed: true,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        actualOutput: tc.expectedOutput,
        runtime: 100,
        memory: 50,
        isExample: tc.isExample,
      }));

      const mockSubmission = {
        id: 'submission-123',
        userId,
        problemId,
        code: 'def add(a, b): return a + b',
        language: 'python',
        status: 'Accepted',
        runtime: 100,
        memory: 50,
        runtimePercentile: 50.0,
        memoryPercentile: 50.0,
        testsPassed: 2,
        totalTests: 2,
      };

      const mockProgress = {
        id: 'progress-123',
        userId,
        totalSolved: 1,
        easySolved: 1,
        mediumSolved: 0,
        hardSolved: 0,
        totalSubmissions: 0,
        acceptedSubmissions: 0,
        acceptanceRate: 0,
        solvedByTopic: {},
        dailyActivity: {},
        streak: 0,
        save: jest.fn().mockResolvedValue(true),
      };

      CodingProblem.findByPk.mockResolvedValue(problem);
      TestCase.findAll.mockResolvedValue(testCases);
      runTestCases.mockResolvedValue(mockResults);
      Submission.create.mockResolvedValue(mockSubmission);
      Submission.findOne.mockResolvedValue(null);
      Submission.count.mockResolvedValue(1);
      StudentProgress.findOne.mockResolvedValue(mockProgress);

      req.body = {
        problemId,
        code: 'def add(a, b): return a + b',
        language: 'python',
        userId,
      };

      await submitCode(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();

      const response = res.json.mock.calls[0][0];
      expect(response.success).toBe(true);
      expect(response.status).toBe('Accepted');
      expect(response.testsPassed).toBe(2);
      expect(response.totalTests).toBe(2);
    });
  });
});
