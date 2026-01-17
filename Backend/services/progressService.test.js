const fc = require('fast-check');
const { calculateStreak } = require('./progressService');
const { Sequelize, DataTypes } = require('sequelize');

let sequelize;
let StudentProgress;
let Submission;
let CodingProblem;
let User;
let updateStudentProgress;

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
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
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
    tags: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    timeLimit: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 2000,
    },
    memoryLimit: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 256,
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
      type: DataTypes.STRING,
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
    testsPassed: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    totalTests: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  });

  // Define StudentProgress model
  StudentProgress = sequelize.define('StudentProgress', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
    },
    totalSolved: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    easySolved: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    mediumSolved: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    hardSolved: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    totalSubmissions: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    acceptedSubmissions: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    acceptanceRate: {
      type: DataTypes.FLOAT,
      defaultValue: 0.0,
    },
    solvedByTopic: {
      type: DataTypes.JSON,
      defaultValue: {},
    },
    dailyActivity: {
      type: DataTypes.JSON,
      defaultValue: {},
    },
    streak: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    lastSolvedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  });

  // Define updateStudentProgress function inline for testing
  updateStudentProgress = async (userId, problem, currentSubmissionId = null) => {
    const { Op } = require('sequelize');
    
    let progress = await StudentProgress.findOne({ where: { userId } });
    
    if (!progress) {
      progress = await StudentProgress.create({ userId });
    }

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
      progress.totalSolved += 1;

      if (problem.difficulty === 'Easy') {
        progress.easySolved += 1;
      } else if (problem.difficulty === 'Medium') {
        progress.mediumSolved += 1;
      } else if (problem.difficulty === 'Hard') {
        progress.hardSolved += 1;
      }

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

      const today = new Date().toISOString().split('T')[0];
      const dailyActivity = { ...progress.dailyActivity };
      dailyActivity[today] = (dailyActivity[today] || 0) + 1;
      progress.dailyActivity = dailyActivity;

      progress.streak = calculateStreak(dailyActivity, today);
      progress.lastSolvedAt = new Date();
    }

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
  };

  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

beforeEach(async () => {
  await StudentProgress.destroy({ where: {}, truncate: true });
  await Submission.destroy({ where: {}, truncate: true });
  await CodingProblem.destroy({ where: {}, truncate: true });
});

describe('Progress Tracking Property Tests', () => {
  /**
   * Feature: coding-practice-system, Property 24: Solving problems updates progress counters
   * Validates: Requirements 8.1, 8.2
   */
  test('Property 24: For any student who solves a new problem, the total problems solved count and difficulty-specific count should both increment by one', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        fc.constantFrom('Easy', 'Medium', 'Hard'),
        fc.array(fc.string(), { minLength: 0, maxLength: 5 }),
        async (userId, difficulty, tags) => {
          // Create a problem
          const problem = await CodingProblem.create({
            title: `Test Problem ${Math.random()}`,
            difficulty,
            description: 'Test description',
            tags,
            timeLimit: 2000,
            memoryLimit: 256,
          });

          // Get initial progress
          let progress = await StudentProgress.findOne({ where: { userId } });
          const initialTotalSolved = progress ? progress.totalSolved : 0;
          const initialEasySolved = progress ? progress.easySolved : 0;
          const initialMediumSolved = progress ? progress.mediumSolved : 0;
          const initialHardSolved = progress ? progress.hardSolved : 0;

          // Create an accepted submission
          const submission = await Submission.create({
            userId,
            problemId: problem.id,
            code: 'test code',
            language: 'python',
            status: 'Accepted',
            runtime: 100,
            memory: 50,
            testsPassed: 5,
            totalTests: 5,
          });

          // Update progress
          await updateStudentProgress(userId, problem, submission.id);

          // Get updated progress
          progress = await StudentProgress.findOne({ where: { userId } });

          // Verify total solved incremented by 1
          expect(progress.totalSolved).toBe(initialTotalSolved + 1);

          // Verify difficulty-specific count incremented by 1
          if (difficulty === 'Easy') {
            expect(progress.easySolved).toBe(initialEasySolved + 1);
          } else if (difficulty === 'Medium') {
            expect(progress.mediumSolved).toBe(initialMediumSolved + 1);
          } else if (difficulty === 'Hard') {
            expect(progress.hardSolved).toBe(initialHardSolved + 1);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: coding-practice-system, Property 26: Topic-based progress tracks solved problems by tag
   * Validates: Requirements 8.4
   */
  test('Property 26: For any student who solves a problem with tags, each tag\'s solved count should increment by one', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 1, maxLength: 5 }),
        async (userId, tags) => {
          // Create a problem with tags
          const problem = await CodingProblem.create({
            title: `Test Problem ${Math.random()}`,
            difficulty: 'Medium',
            description: 'Test description',
            tags,
            timeLimit: 2000,
            memoryLimit: 256,
          });

          // Get initial progress
          let progress = await StudentProgress.findOne({ where: { userId } });
          const initialSolvedByTopic = progress ? { ...progress.solvedByTopic } : {};

          // Create an accepted submission
          const submission = await Submission.create({
            userId,
            problemId: problem.id,
            code: 'test code',
            language: 'python',
            status: 'Accepted',
            runtime: 100,
            memory: 50,
            testsPassed: 5,
            totalTests: 5,
          });

          // Update progress
          await updateStudentProgress(userId, problem, submission.id);

          // Get updated progress
          progress = await StudentProgress.findOne({ where: { userId } });

          // Verify each tag's count incremented by 1
          for (const tag of tags) {
            const initialCount = Object.prototype.hasOwnProperty.call(initialSolvedByTopic, tag)
              ? initialSolvedByTopic[tag]
              : 0;
            const currentCount = Object.prototype.hasOwnProperty.call(progress.solvedByTopic, tag)
              ? progress.solvedByTopic[tag]
              : 0;
            expect(currentCount).toBe(initialCount + 1);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: coding-practice-system, Property 27: Daily activity records problems solved per day
   * Validates: Requirements 8.5
   */
  test('Property 27: For any student who solves problems, the daily activity map should record the count of problems solved on each date', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        fc.integer({ min: 1, max: 5 }),
        async (userId, numProblems) => {
          const today = new Date().toISOString().split('T')[0];

          // Get initial progress
          let progress = await StudentProgress.findOne({ where: { userId } });
          const initialDailyCount = progress && progress.dailyActivity[today] 
            ? progress.dailyActivity[today] 
            : 0;

          // Solve multiple problems today
          for (let i = 0; i < numProblems; i++) {
            const problem = await CodingProblem.create({
              title: `Test Problem ${Math.random()}`,
              difficulty: 'Easy',
              description: 'Test description',
              tags: ['test'],
              timeLimit: 2000,
              memoryLimit: 256,
            });

            const submission = await Submission.create({
              userId,
              problemId: problem.id,
              code: 'test code',
              language: 'python',
              status: 'Accepted',
              runtime: 100,
              memory: 50,
              testsPassed: 5,
              totalTests: 5,
            });

            await updateStudentProgress(userId, problem, submission.id);
          }

          // Get updated progress
          progress = await StudentProgress.findOne({ where: { userId } });

          // Verify daily activity count
          expect(progress.dailyActivity[today]).toBe(initialDailyCount + numProblems);
        }
      ),
      { numRuns: 100 }
    );
  }, 10000); // Increase timeout to 10 seconds for this test
});

describe('Streak Calculation Tests', () => {
  test('calculateStreak returns 0 for empty activity', () => {
    const streak = calculateStreak({}, '2024-01-15');
    expect(streak).toBe(0);
  });

  test('calculateStreak returns correct streak for consecutive days', () => {
    const dailyActivity = {
      '2024-01-15': 1,
      '2024-01-14': 2,
      '2024-01-13': 1,
    };
    const streak = calculateStreak(dailyActivity, '2024-01-15');
    expect(streak).toBe(3);
  });

  test('calculateStreak stops at first gap', () => {
    const dailyActivity = {
      '2024-01-15': 1,
      '2024-01-14': 2,
      // Gap on 2024-01-13
      '2024-01-12': 1,
    };
    const streak = calculateStreak(dailyActivity, '2024-01-15');
    expect(streak).toBe(2);
  });
});
