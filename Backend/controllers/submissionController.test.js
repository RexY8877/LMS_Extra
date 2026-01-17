const fc = require('fast-check');

// Mock dependencies before requiring the controller
jest.mock('../models/Submission', () => ({
  findAll: jest.fn(),
  findByPk: jest.fn(),
}));

jest.mock('../models/StudentProgress', () => ({
  findOne: jest.fn(),
}));

const { getSubmissionHistory, getSubmissionById, getUserStats } = require('./submissionController');
const Submission = require('../models/Submission');
const StudentProgress = require('../models/StudentProgress');

describe('Submission Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: {},
      query: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    
    // Clear all mocks
    jest.clearAllMocks();
    Submission.findAll.mockReset();
    Submission.findByPk.mockReset();
    StudentProgress.findOne.mockReset();
  });

  describe('getSubmissionHistory', () => {
    /**
     * Feature: coding-practice-system, Property 20: Submission history is ordered by timestamp
     * Validates: Requirements 7.1
     */
    it('should return submissions ordered by timestamp descending', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1 }),
          fc.string({ minLength: 1 }),
          fc.integer({ min: 2, max: 10 }),
          async (userIdSuffix, problemIdSuffix, numSubmissions) => {
            // Reset mocks for each iteration
            jest.clearAllMocks();
            Submission.findAll.mockReset();
            
            const userId = `user-${userIdSuffix}`;
            const problemId = `problem-${problemIdSuffix}`;

            // Generate submissions with different timestamps
            const baseTime = new Date('2024-01-01T00:00:00Z').getTime();
            const submissions = Array.from({ length: numSubmissions }, (_, i) => ({
              id: `submission-${i}`,
              userId,
              problemId,
              status: 'Accepted',
              runtime: 100 + i * 10,
              memory: 50 + i * 5,
              runtimePercentile: 50.0,
              memoryPercentile: 50.0,
              testsPassed: 5,
              totalTests: 5,
              language: 'python',
              createdAt: new Date(baseTime + i * 1000 * 60), // Each submission 1 minute apart
            }));

            // Sort by timestamp descending (most recent first)
            const sortedSubmissions = [...submissions].sort((a, b) => 
              b.createdAt.getTime() - a.createdAt.getTime()
            );

            Submission.findAll.mockResolvedValue(sortedSubmissions);

            req.params = { userId, problemId };

            await getSubmissionHistory(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            const response = res.json.mock.calls[0][0];

            // Property: Submissions must be ordered by timestamp descending
            expect(response.success).toBe(true);
            expect(response.submissions).toBeDefined();
            expect(response.submissions.length).toBe(numSubmissions);

            // Verify ordering
            for (let i = 0; i < response.submissions.length - 1; i++) {
              const current = new Date(response.submissions[i].createdAt).getTime();
              const next = new Date(response.submissions[i + 1].createdAt).getTime();
              expect(current).toBeGreaterThanOrEqual(next);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Feature: coding-practice-system, Property 21: Submission records contain required metrics
     * Validates: Requirements 7.2
     */
    it('should include status, runtime, memory, and timestamp in all submissions', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1 }),
          fc.string({ minLength: 1 }),
          fc.integer({ min: 1, max: 5 }),
          async (userIdSuffix, problemIdSuffix, numSubmissions) => {
            // Reset mocks for each iteration
            jest.clearAllMocks();
            Submission.findAll.mockReset();
            
            const userId = `user-${userIdSuffix}`;
            const problemId = `problem-${problemIdSuffix}`;

            const submissions = Array.from({ length: numSubmissions }, (_, i) => ({
              id: `submission-${i}`,
              userId,
              problemId,
              status: i % 2 === 0 ? 'Accepted' : 'Wrong Answer',
              runtime: 100 + i * 10,
              memory: 50 + i * 5,
              runtimePercentile: 50.0 + i,
              memoryPercentile: 50.0 + i,
              testsPassed: i % 2 === 0 ? 5 : 3,
              totalTests: 5,
              language: 'python',
              createdAt: new Date(),
            }));

            Submission.findAll.mockResolvedValue(submissions);

            req.params = { userId, problemId };

            await getSubmissionHistory(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            const response = res.json.mock.calls[0][0];

            // Property: All submissions must contain required metrics
            expect(response.success).toBe(true);
            response.submissions.forEach(submission => {
              expect(submission).toHaveProperty('status');
              expect(submission).toHaveProperty('runtime');
              expect(submission).toHaveProperty('memory');
              expect(submission).toHaveProperty('createdAt');
              expect(submission.status).toBeDefined();
              expect(submission.runtime).toBeDefined();
              expect(submission.memory).toBeDefined();
              expect(submission.createdAt).toBeDefined();
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Feature: coding-practice-system, Property 23: Status filtering returns only matching submissions
     * Validates: Requirements 7.5
     */
    it('should filter submissions by status when status query parameter is provided', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1 }),
          fc.string({ minLength: 1 }),
          fc.constantFrom('Accepted', 'Wrong Answer', 'Time Limit Exceeded'),
          fc.integer({ min: 1, max: 10 }),
          async (userIdSuffix, problemIdSuffix, filterStatus, numSubmissions) => {
            // Reset mocks for each iteration
            jest.clearAllMocks();
            Submission.findAll.mockReset();
            
            const userId = `user-${userIdSuffix}`;
            const problemId = `problem-${problemIdSuffix}`;

            // Create submissions with the filtered status
            const submissions = Array.from({ length: numSubmissions }, (_, i) => ({
              id: `submission-${i}`,
              userId,
              problemId,
              status: filterStatus,
              runtime: 100 + i * 10,
              memory: 50 + i * 5,
              runtimePercentile: 50.0,
              memoryPercentile: 50.0,
              testsPassed: filterStatus === 'Accepted' ? 5 : 3,
              totalTests: 5,
              language: 'python',
              createdAt: new Date(),
            }));

            Submission.findAll.mockResolvedValue(submissions);

            req.params = { userId, problemId };
            req.query = { status: filterStatus };

            await getSubmissionHistory(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            const response = res.json.mock.calls[0][0];

            // Property: All returned submissions must have the filtered status
            expect(response.success).toBe(true);
            response.submissions.forEach(submission => {
              expect(submission.status).toBe(filterStatus);
            });

            // Verify the mock was called with correct filter
            expect(Submission.findAll).toHaveBeenCalledWith(
              expect.objectContaining({
                where: expect.objectContaining({
                  userId,
                  problemId,
                  status: filterStatus,
                }),
              })
            );
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return empty array when no submissions exist', async () => {
      Submission.findAll.mockResolvedValue([]);

      req.params = { userId: 'user-123', problemId: 'problem-123' };

      await getSubmissionHistory(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 0,
        submissions: [],
      });
    });
  });

  describe('getSubmissionById', () => {
    /**
     * Feature: coding-practice-system, Property 22: Submission details include code and results
     * Validates: Requirements 7.3
     */
    it('should return submission with code and all result details', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1 }),
          fc.string({ minLength: 10, maxLength: 500 }),
          fc.constantFrom('python', 'javascript', 'java'),
          fc.constantFrom('Accepted', 'Wrong Answer', 'Time Limit Exceeded'),
          async (submissionIdSuffix, code, language, status) => {
            // Reset mocks for each iteration
            jest.clearAllMocks();
            Submission.findByPk.mockReset();
            
            const submissionId = `submission-${submissionIdSuffix}`;

            // Generate test results
            const testResults = [
              {
                testCaseId: 'test-1',
                passed: status === 'Accepted',
                input: '5',
                expectedOutput: '25',
                actualOutput: status === 'Accepted' ? '25' : '24',
                runtime: 100,
                memory: 50,
                error: status === 'Accepted' ? undefined : 'Wrong output',
              },
              {
                testCaseId: 'test-2',
                passed: status === 'Accepted',
                input: '10',
                expectedOutput: '100',
                actualOutput: status === 'Accepted' ? '100' : '99',
                runtime: 120,
                memory: 55,
                error: status === 'Accepted' ? undefined : 'Wrong output',
              },
            ];

            const mockSubmission = {
              id: submissionId,
              userId: 'user-123',
              problemId: 'problem-123',
              code,
              language,
              status,
              runtime: 150,
              memory: 75,
              runtimePercentile: 60.0,
              memoryPercentile: 55.0,
              testsPassed: status === 'Accepted' ? 5 : 3,
              totalTests: 5,
              testResults,
              createdAt: new Date(),
              updatedAt: new Date(),
            };

            Submission.findByPk.mockResolvedValue(mockSubmission);

            req.params = { id: submissionId };

            await getSubmissionById(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            const response = res.json.mock.calls[0][0];

            // Property: Submission details must include code and all result fields
            expect(response.success).toBe(true);
            expect(response.submission).toBeDefined();
            expect(response.submission.code).toBe(code);
            expect(response.submission.language).toBe(language);
            expect(response.submission.status).toBe(status);
            expect(response.submission).toHaveProperty('runtime');
            expect(response.submission).toHaveProperty('memory');
            expect(response.submission).toHaveProperty('testsPassed');
            expect(response.submission).toHaveProperty('totalTests');
            expect(response.submission).toHaveProperty('testResults');
            expect(response.submission).toHaveProperty('createdAt');
            
            // Verify test results are included
            expect(response.submission.testResults).toBeDefined();
            expect(Array.isArray(response.submission.testResults)).toBe(true);
            expect(response.submission.testResults.length).toBeGreaterThan(0);
            
            // Verify each test result has required fields
            response.submission.testResults.forEach(result => {
              expect(result).toHaveProperty('testCaseId');
              expect(result).toHaveProperty('passed');
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return 404 when submission is not found', async () => {
      Submission.findByPk.mockResolvedValue(null);

      req.params = { id: 'non-existent-id' };

      await getSubmissionById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Submission not found',
      });
    });
  });

  describe('getUserStats', () => {
    /**
     * Feature: coding-practice-system, Property 25: Profile displays complete progress statistics
     * Validates: Requirements 8.3
     */
    it('should return complete progress statistics including acceptance rate, problems by difficulty, and topics', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1 }),
          fc.integer({ min: 0, max: 100 }),
          fc.integer({ min: 0, max: 50 }),
          fc.integer({ min: 0, max: 30 }),
          fc.integer({ min: 0, max: 20 }),
          fc.integer({ min: 1, max: 200 }),
          fc.integer({ min: 1, max: 200 }),
          async (userIdSuffix, totalSolved, easySolved, mediumSolved, hardSolved, totalSubmissions, acceptedSubmissions) => {
            // Reset mocks for each iteration
            jest.clearAllMocks();
            StudentProgress.findOne.mockReset();
            
            const userId = `user-${userIdSuffix}`;
            
            // Ensure consistency: totalSolved should be sum of difficulty counts
            const adjustedTotalSolved = easySolved + mediumSolved + hardSolved;
            
            // Ensure acceptedSubmissions doesn't exceed totalSubmissions
            const adjustedAcceptedSubmissions = Math.min(acceptedSubmissions, totalSubmissions);
            
            const acceptanceRate = totalSubmissions > 0 
              ? (adjustedAcceptedSubmissions / totalSubmissions) * 100 
              : 0;

            // Generate random topic data
            const solvedByTopic = {
              'arrays': Math.floor(Math.random() * adjustedTotalSolved),
              'strings': Math.floor(Math.random() * adjustedTotalSolved),
              'dynamic-programming': Math.floor(Math.random() * adjustedTotalSolved),
            };

            // Generate random daily activity
            const dailyActivity = {
              '2024-01-01': Math.floor(Math.random() * 5) + 1,
              '2024-01-02': Math.floor(Math.random() * 5) + 1,
              '2024-01-03': Math.floor(Math.random() * 5) + 1,
            };

            const mockProgress = {
              userId,
              totalSolved: adjustedTotalSolved,
              easySolved,
              mediumSolved,
              hardSolved,
              totalSubmissions,
              acceptedSubmissions: adjustedAcceptedSubmissions,
              acceptanceRate,
              solvedByTopic,
              dailyActivity,
              streak: Math.floor(Math.random() * 30),
              lastSolvedAt: new Date(),
            };

            StudentProgress.findOne.mockResolvedValue(mockProgress);

            req.params = { userId };

            await getUserStats(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            const response = res.json.mock.calls[0][0];

            // Property: Profile must display complete progress statistics
            expect(response.success).toBe(true);
            expect(response.stats).toBeDefined();
            
            // Verify acceptance rate is present
            expect(response.stats).toHaveProperty('acceptanceRate');
            expect(response.stats.acceptanceRate).toBe(acceptanceRate);
            
            // Verify total submissions and successful submissions
            expect(response.stats).toHaveProperty('totalSubmissions');
            expect(response.stats).toHaveProperty('acceptedSubmissions');
            expect(response.stats.totalSubmissions).toBe(totalSubmissions);
            expect(response.stats.acceptedSubmissions).toBe(adjustedAcceptedSubmissions);
            
            // Verify problems solved by difficulty
            expect(response.stats).toHaveProperty('totalSolved');
            expect(response.stats).toHaveProperty('easySolved');
            expect(response.stats).toHaveProperty('mediumSolved');
            expect(response.stats).toHaveProperty('hardSolved');
            expect(response.stats.totalSolved).toBe(adjustedTotalSolved);
            expect(response.stats.easySolved).toBe(easySolved);
            expect(response.stats.mediumSolved).toBe(mediumSolved);
            expect(response.stats.hardSolved).toBe(hardSolved);
            
            // Verify topic-based progress
            expect(response.stats).toHaveProperty('solvedByTopic');
            expect(response.stats.solvedByTopic).toEqual(solvedByTopic);
            
            // Verify daily activity
            expect(response.stats).toHaveProperty('dailyActivity');
            expect(response.stats.dailyActivity).toEqual(dailyActivity);
            
            // Verify streak and lastSolvedAt
            expect(response.stats).toHaveProperty('streak');
            expect(response.stats).toHaveProperty('lastSolvedAt');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return default stats when no progress exists for user', async () => {
      StudentProgress.findOne.mockResolvedValue(null);

      req.params = { userId: 'new-user-123' };

      await getUserStats(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      
      expect(response.success).toBe(true);
      expect(response.stats).toEqual({
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
      });
    });
  });
});
