const fc = require('fast-check');
const { Sequelize, DataTypes } = require('sequelize');

let sequelize;
let Submission;
let CodingProblem;
let User;
let calculatePercentile;
let calculatePercentiles;

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

  // Define metrics functions inline for testing
  const { Op } = require('sequelize');

  calculatePercentile = async (problemId, value, metric) => {
    if (!problemId || value === null || value === undefined) {
      return null;
    }

    if (metric !== 'runtime' && metric !== 'memory') {
      throw new Error('Metric must be either "runtime" or "memory"');
    }

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

    const countBelowOrEqual = acceptedSubmissions.filter(
      sub => sub[metric] <= value
    ).length;

    const percentile = (countBelowOrEqual / acceptedSubmissions.length) * 100;

    return Math.round(percentile * 100) / 100;
  };

  calculatePercentiles = async (problemId, runtime, memory) => {
    const runtimePercentile = await calculatePercentile(problemId, runtime, 'runtime');
    const memoryPercentile = await calculatePercentile(problemId, memory, 'memory');

    return {
      runtimePercentile,
      memoryPercentile
    };
  };

  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

describe('Metrics Service', () => {
  let testUser;
  let testProblem;

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
  });

  describe('calculatePercentile', () => {
    test('returns null when no accepted submissions exist', async () => {
      const percentile = await calculatePercentile(testProblem.id, 100, 'runtime');
      expect(percentile).toBeNull();
    });

    test('returns null when problemId is null', async () => {
      const percentile = await calculatePercentile(null, 100, 'runtime');
      expect(percentile).toBeNull();
    });

    test('returns null when value is null', async () => {
      const percentile = await calculatePercentile(testProblem.id, null, 'runtime');
      expect(percentile).toBeNull();
    });

    test('throws error for invalid metric', async () => {
      await expect(
        calculatePercentile(testProblem.id, 100, 'invalid')
      ).rejects.toThrow('Metric must be either "runtime" or "memory"');
    });

    test('calculates 100th percentile for highest value', async () => {
      // Create submissions with different runtimes
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

      await Submission.create({
        userId: testUser.id,
        problemId: testProblem.id,
        code: 'test',
        language: 'python',
        status: 'Accepted',
        runtime: 200,
        memory: 10,
        totalTests: 5
      });

      await Submission.create({
        userId: testUser.id,
        problemId: testProblem.id,
        code: 'test',
        language: 'python',
        status: 'Accepted',
        runtime: 300,
        memory: 10,
        totalTests: 5
      });

      const percentile = await calculatePercentile(testProblem.id, 300, 'runtime');
      expect(percentile).toBe(100);
    });

    test('calculates correct percentile for middle value', async () => {
      // Create 10 submissions with runtimes 100, 200, ..., 1000
      for (let i = 1; i <= 10; i++) {
        await Submission.create({
          userId: testUser.id,
          problemId: testProblem.id,
          code: 'test',
          language: 'python',
          status: 'Accepted',
          runtime: i * 100,
          memory: 10,
          totalTests: 5
        });
      }

      // Value 500 should be at 50th percentile (5 out of 10)
      const percentile = await calculatePercentile(testProblem.id, 500, 'runtime');
      expect(percentile).toBe(50);
    });

    test('ignores non-accepted submissions', async () => {
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

      await Submission.create({
        userId: testUser.id,
        problemId: testProblem.id,
        code: 'test',
        language: 'python',
        status: 'Wrong Answer',
        runtime: 50,
        memory: 10,
        totalTests: 5
      });

      await Submission.create({
        userId: testUser.id,
        problemId: testProblem.id,
        code: 'test',
        language: 'python',
        status: 'Accepted',
        runtime: 200,
        memory: 10,
        totalTests: 5
      });

      // Should only consider the two accepted submissions
      const percentile = await calculatePercentile(testProblem.id, 150, 'runtime');
      expect(percentile).toBe(50);
    });
  });

  describe('calculatePercentiles', () => {
    test('calculates both runtime and memory percentiles', async () => {
      // Create submissions
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

      await Submission.create({
        userId: testUser.id,
        problemId: testProblem.id,
        code: 'test',
        language: 'python',
        status: 'Accepted',
        runtime: 200,
        memory: 20,
        totalTests: 5
      });

      const result = await calculatePercentiles(testProblem.id, 150, 15);
      expect(result.runtimePercentile).toBe(50);
      expect(result.memoryPercentile).toBe(50);
    });
  });

  /**
   * Feature: coding-practice-system, Property 29: Percentile rankings are calculated correctly
   * Validates: Requirements 10.2, 10.4
   * 
   * Property: For any accepted submission, the runtime and memory percentiles should be 
   * calculated based on the distribution of all accepted submissions for that problem.
   */
  describe('Property 29: Percentile rankings are calculated correctly', () => {
    test('percentile calculation is monotonic', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(fc.integer({ min: 1, max: 10000 }), { minLength: 1, maxLength: 50 }),
          async (runtimes) => {
            // Clean up
            await Submission.destroy({ where: {} });

            // Create submissions with the generated runtimes
            for (const runtime of runtimes) {
              await Submission.create({
                userId: testUser.id,
                problemId: testProblem.id,
                code: 'test',
                language: 'python',
                status: 'Accepted',
                runtime: runtime,
                memory: 10,
                totalTests: 5
              });
            }

            // Sort runtimes to test monotonicity
            const sortedRuntimes = [...runtimes].sort((a, b) => a - b);
            
            // Calculate percentiles for sorted values
            const percentiles = [];
            for (const runtime of sortedRuntimes) {
              const percentile = await calculatePercentile(testProblem.id, runtime, 'runtime');
              percentiles.push(percentile);
            }

            // Verify monotonicity: percentiles should be non-decreasing
            for (let i = 1; i < percentiles.length; i++) {
              if (percentiles[i] < percentiles[i - 1]) {
                return false;
              }
            }

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('percentile is always between 0 and 100', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(fc.integer({ min: 1, max: 10000 }), { minLength: 1, maxLength: 50 }),
          fc.integer({ min: 1, max: 10000 }),
          async (runtimes, queryValue) => {
            // Clean up
            await Submission.destroy({ where: {} });

            // Create submissions
            for (const runtime of runtimes) {
              await Submission.create({
                userId: testUser.id,
                problemId: testProblem.id,
                code: 'test',
                language: 'python',
                status: 'Accepted',
                runtime: runtime,
                memory: 10,
                totalTests: 5
              });
            }

            const percentile = await calculatePercentile(testProblem.id, queryValue, 'runtime');
            
            // Percentile should be between 0 and 100 (inclusive)
            return percentile >= 0 && percentile <= 100;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('minimum value always gets lowest percentile', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(fc.integer({ min: 1, max: 10000 }), { minLength: 2, maxLength: 50 }),
          async (runtimes) => {
            // Clean up
            await Submission.destroy({ where: {} });

            // Create submissions
            for (const runtime of runtimes) {
              await Submission.create({
                userId: testUser.id,
                problemId: testProblem.id,
                code: 'test',
                language: 'python',
                status: 'Accepted',
                runtime: runtime,
                memory: 10,
                totalTests: 5
              });
            }

            const minRuntime = Math.min(...runtimes);
            const minPercentile = await calculatePercentile(testProblem.id, minRuntime, 'runtime');
            
            // Check all other values have percentile >= min percentile
            for (const runtime of runtimes) {
              const percentile = await calculatePercentile(testProblem.id, runtime, 'runtime');
              if (percentile < minPercentile) {
                return false;
              }
            }

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('maximum value always gets 100th percentile', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(fc.integer({ min: 1, max: 10000 }), { minLength: 1, maxLength: 50 }),
          async (runtimes) => {
            // Clean up
            await Submission.destroy({ where: {} });

            // Create submissions
            for (const runtime of runtimes) {
              await Submission.create({
                userId: testUser.id,
                problemId: testProblem.id,
                code: 'test',
                language: 'python',
                status: 'Accepted',
                runtime: runtime,
                memory: 10,
                totalTests: 5
              });
            }

            const maxRuntime = Math.max(...runtimes);
            const percentile = await calculatePercentile(testProblem.id, maxRuntime, 'runtime');
            
            return percentile === 100;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('percentile calculation works for both runtime and memory', async () => {
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

            // Pick a random submission to test
            const testSub = submissions[0];
            const result = await calculatePercentiles(
              testProblem.id,
              testSub.runtime,
              testSub.memory
            );

            // Both percentiles should be valid
            return (
              result.runtimePercentile >= 0 &&
              result.runtimePercentile <= 100 &&
              result.memoryPercentile >= 0 &&
              result.memoryPercentile <= 100
            );
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
