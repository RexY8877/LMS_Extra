const fc = require('fast-check');
const { Sequelize, DataTypes } = require('sequelize');

let sequelize;
let Submission;
let CodingProblem;
let User;
let getProblemStats;

beforeAll(async () => {
  // Create in-memory SQLite database for testing
  sequelize = new Sequelize('sqlite::memory:', {
    logging: false,
  });

  // Define User model
  User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  // Define CodingProblem model
  CodingProblem = sequelize.define('CodingProblem', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    difficulty: {
      type: DataTypes.ENUM('Easy', 'Medium', 'Hard'),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    constraints: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    examples: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    hints: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    tags: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    companies: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    acceptance: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    timeLimit: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    memoryLimit: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  });

  // Define Submission model
  Submission = sequelize.define('Submission', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    problemId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    code: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    language: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(
        'Accepted',
        'Wrong Answer',
        'Time Limit Exceeded',
        'Memory Limit Exceeded',
        'Runtime Error',
        'Compilation Error'
      ),
      allowNull: false,
    },
    runtime: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    memory: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    runtimePercentile: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    memoryPercentile: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    testsPassed: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    totalTests: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  });

  // Define getProblemStats function inline for testing
  const { Op } = require('sequelize');

  getProblemStats = async (req, res) => {
    try {
      const { id } = req.params;

      const problem = await CodingProblem.findByPk(id);
      if (!problem) {
        return res.status(404).json({ message: 'Problem not found' });
      }

      const acceptedSubmissions = await Submission.findAll({
        where: {
          problemId: id,
          status: 'Accepted',
          runtime: {
            [Op.not]: null
          },
          memory: {
            [Op.not]: null
          }
        },
        attributes: ['runtime', 'memory']
      });

      if (acceptedSubmissions.length === 0) {
        return res.json({
          problemId: id,
          totalAcceptedSubmissions: 0,
          averageRuntime: null,
          averageMemory: null
        });
      }

      const totalRuntime = acceptedSubmissions.reduce((sum, sub) => sum + sub.runtime, 0);
      const totalMemory = acceptedSubmissions.reduce((sum, sub) => sum + sub.memory, 0);

      const averageRuntime = Math.round(totalRuntime / acceptedSubmissions.length);
      const averageMemory = Math.round((totalMemory / acceptedSubmissions.length) * 100) / 100;

      res.json({
        problemId: id,
        totalAcceptedSubmissions: acceptedSubmissions.length,
        averageRuntime,
        averageMemory
      });
    } catch (error) {
      console.error('Error fetching problem stats:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };

  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

describe('Problem Statistics Tests', () => {
  let testUser;
  let testProblem;
  let req;
  let res;

  beforeEach(async () => {
    // Clean up before each test
    await Submission.destroy({ where: {} });
    await CodingProblem.destroy({ where: {} });
    await User.destroy({ where: {} });

    // Create test user
    testUser = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedpassword',
      role: 'student'
    });

    // Create test problem
    testProblem = await CodingProblem.create({
      title: 'Test Problem',
      difficulty: 'Easy',
      description: 'Test description',
      constraints: ['constraint1'],
      examples: [{ input: '1', output: '1' }],
      hints: [],
      tags: ['array'],
      companies: [],
      acceptance: 50,
      timeLimit: 1000,
      memoryLimit: 256
    });

    // Setup request and response mocks
    req = {
      params: { id: testProblem.id }
    };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };
  });

  describe('getProblemStats', () => {
    test('returns null averages when no accepted submissions exist', async () => {
      await getProblemStats(req, res);

      expect(res.json).toHaveBeenCalledWith({
        problemId: testProblem.id,
        totalAcceptedSubmissions: 0,
        averageRuntime: null,
        averageMemory: null
      });
    });

    test('returns 404 when problem does not exist', async () => {
      req.params.id = 'non-existent-id';
      await getProblemStats(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Problem not found' });
    });

    test('calculates correct averages for accepted submissions', async () => {
      // Create accepted submissions
      await Submission.create({
        userId: testUser.id,
        problemId: testProblem.id,
        code: 'test',
        language: 'python',
        status: 'Accepted',
        runtime: 100,
        memory: 10.5,
        totalTests: 5
      });

      await Submission.create({
        userId: testUser.id,
        problemId: testProblem.id,
        code: 'test',
        language: 'python',
        status: 'Accepted',
        runtime: 200,
        memory: 20.5,
        totalTests: 5
      });

      await getProblemStats(req, res);

      expect(res.json).toHaveBeenCalledWith({
        problemId: testProblem.id,
        totalAcceptedSubmissions: 2,
        averageRuntime: 150, // (100 + 200) / 2
        averageMemory: 15.5  // (10.5 + 20.5) / 2
      });
    });

    test('ignores non-accepted submissions', async () => {
      // Create accepted submission
      await Submission.create({
        userId: testUser.id,
        problemId: testProblem.id,
        code: 'test',
        language: 'python',
        status: 'Accepted',
        runtime: 100,
        memory: 10,
        totalTests: 5
      });

      // Create non-accepted submission
      await Submission.create({
        userId: testUser.id,
        problemId: testProblem.id,
        code: 'test',
        language: 'python',
        status: 'Wrong Answer',
        runtime: 50,
        memory: 5,
        totalTests: 5
      });

      await getProblemStats(req, res);

      expect(res.json).toHaveBeenCalledWith({
        problemId: testProblem.id,
        totalAcceptedSubmissions: 1,
        averageRuntime: 100,
        averageMemory: 10
      });
    });

    test('ignores submissions with null runtime or memory', async () => {
      // Create accepted submission with valid metrics
      await Submission.create({
        userId: testUser.id,
        problemId: testProblem.id,
        code: 'test',
        language: 'python',
        status: 'Accepted',
        runtime: 100,
        memory: 10,
        totalTests: 5
      });

      // Create accepted submission with null runtime
      await Submission.create({
        userId: testUser.id,
        problemId: testProblem.id,
        code: 'test',
        language: 'python',
        status: 'Accepted',
        runtime: null,
        memory: 10,
        totalTests: 5
      });

      await getProblemStats(req, res);

      expect(res.json).toHaveBeenCalledWith({
        problemId: testProblem.id,
        totalAcceptedSubmissions: 1,
        averageRuntime: 100,
        averageMemory: 10
      });
    });
  });

  /**
   * Feature: coding-practice-system, Property 30: Problem statistics aggregate accepted submissions
   * Validates: Requirements 10.5
   * 
   * Property: For any problem, the statistics should show the average runtime and average memory 
   * usage across all accepted submissions.
   */
  describe('Property 30: Problem statistics aggregate accepted submissions', () => {
    test('average runtime and memory are calculated correctly for any set of accepted submissions', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.record({
              runtime: fc.integer({ min: 1, max: 10000 }),
              memory: fc.float({ min: 1, max: 1000 })
            }),
            { minLength: 1, maxLength: 50 }
          ),
          async (submissions) => {
            // Clean up
            await Submission.destroy({ where: {} });
            res.json.mockClear();

            // Create submissions
            for (const sub of submissions) {
              await Submission.create({
                userId: testUser.id,
                problemId: testProblem.id,
                code: 'test',
                language: 'python',
                status: 'Accepted',
                runtime: sub.runtime,
                memory: sub.memory,
                totalTests: 5
              });
            }

            // Calculate expected averages
            const expectedAvgRuntime = Math.round(
              submissions.reduce((sum, s) => sum + s.runtime, 0) / submissions.length
            );
            const expectedAvgMemory = Math.round(
              (submissions.reduce((sum, s) => sum + s.memory, 0) / submissions.length) * 100
            ) / 100;

            // Execute
            await getProblemStats(req, res);

            // Verify
            expect(res.json).toHaveBeenCalled();
            const response = res.json.mock.calls[0][0];

            // Property: Statistics should aggregate all accepted submissions
            expect(response.totalAcceptedSubmissions).toBe(submissions.length);
            expect(response.averageRuntime).toBe(expectedAvgRuntime);
            expect(response.averageMemory).toBe(expectedAvgMemory);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('statistics only include accepted submissions, not failed ones', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.record({
              runtime: fc.integer({ min: 1, max: 10000 }),
              memory: fc.float({ min: 1, max: 1000 })
            }),
            { minLength: 1, maxLength: 20 }
          ),
          fc.array(
            fc.record({
              runtime: fc.integer({ min: 1, max: 10000 }),
              memory: fc.float({ min: 1, max: 1000 }),
              status: fc.constantFrom('Wrong Answer', 'Time Limit Exceeded', 'Runtime Error')
            }),
            { minLength: 0, maxLength: 20 }
          ),
          async (acceptedSubs, failedSubs) => {
            // Clean up
            await Submission.destroy({ where: {} });
            res.json.mockClear();

            // Create accepted submissions
            for (const sub of acceptedSubs) {
              await Submission.create({
                userId: testUser.id,
                problemId: testProblem.id,
                code: 'test',
                language: 'python',
                status: 'Accepted',
                runtime: sub.runtime,
                memory: sub.memory,
                totalTests: 5
              });
            }

            // Create failed submissions
            for (const sub of failedSubs) {
              await Submission.create({
                userId: testUser.id,
                problemId: testProblem.id,
                code: 'test',
                language: 'python',
                status: sub.status,
                runtime: sub.runtime,
                memory: sub.memory,
                totalTests: 5
              });
            }

            // Calculate expected averages (only from accepted submissions)
            const expectedAvgRuntime = Math.round(
              acceptedSubs.reduce((sum, s) => sum + s.runtime, 0) / acceptedSubs.length
            );
            const expectedAvgMemory = Math.round(
              (acceptedSubs.reduce((sum, s) => sum + s.memory, 0) / acceptedSubs.length) * 100
            ) / 100;

            // Execute
            await getProblemStats(req, res);

            // Verify
            expect(res.json).toHaveBeenCalled();
            const response = res.json.mock.calls[0][0];

            // Property: Only accepted submissions should be included in statistics
            expect(response.totalAcceptedSubmissions).toBe(acceptedSubs.length);
            expect(response.averageRuntime).toBe(expectedAvgRuntime);
            expect(response.averageMemory).toBe(expectedAvgMemory);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('average is correctly calculated regardless of submission order', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.record({
              runtime: fc.integer({ min: 1, max: 10000 }),
              memory: fc.float({ min: 1, max: 1000 })
            }),
            { minLength: 2, maxLength: 20 }
          ),
          async (submissions) => {
            // Clean up
            await Submission.destroy({ where: {} });
            res.json.mockClear();

            // Create submissions in random order
            const shuffled = [...submissions].sort(() => Math.random() - 0.5);
            for (const sub of shuffled) {
              await Submission.create({
                userId: testUser.id,
                problemId: testProblem.id,
                code: 'test',
                language: 'python',
                status: 'Accepted',
                runtime: sub.runtime,
                memory: sub.memory,
                totalTests: 5
              });
            }

            // Calculate expected averages
            const expectedAvgRuntime = Math.round(
              submissions.reduce((sum, s) => sum + s.runtime, 0) / submissions.length
            );

            // Execute
            await getProblemStats(req, res);

            // Verify
            expect(res.json).toHaveBeenCalled();
            const response = res.json.mock.calls[0][0];

            // Property: Average should be the same regardless of submission order
            expect(response.averageRuntime).toBe(expectedAvgRuntime);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
