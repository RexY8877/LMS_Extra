const fc = require('fast-check');
const { DataTypes } = require('sequelize');
const { Sequelize } = require('sequelize');

// Feature: coding-practice-system, Property 5: Problem details contain all required fields
// Validates: Requirements 2.1, 2.4, 2.5

describe('CodingProblem Model Validation', () => {
  let sequelize;
  let CodingProblem;

  beforeAll(() => {
    // Create in-memory SQLite database for testing
    sequelize = new Sequelize('sqlite::memory:', {
      logging: false,
    });

    // Define the model inline for testing
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
      acceptance: DataTypes.FLOAT,
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
    }, {
      timestamps: true,
    });
  });

  beforeEach(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  /**
   * Property 5: Problem details contain all required fields
   * For any problem, the detailed view should include title, difficulty, description,
   * constraints, example test cases, and company tags.
   */
  test('Property 5: Problem details contain all required fields', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          title: fc.string({ minLength: 1, maxLength: 200 }),
          difficulty: fc.constantFrom('Easy', 'Medium', 'Hard'),
          description: fc.string({ minLength: 10, maxLength: 5000 }),
          constraints: fc.array(fc.string({ minLength: 1, maxLength: 100 }), { maxLength: 10 }),
          examples: fc.array(
            fc.record({
              input: fc.string({ minLength: 1, maxLength: 100 }),
              output: fc.string({ minLength: 1, maxLength: 100 }),
              explanation: fc.option(fc.string({ maxLength: 200 })),
            }),
            { minLength: 1, maxLength: 5 }
          ),
          hints: fc.array(fc.string({ minLength: 1, maxLength: 200 }), { maxLength: 5 }),
          tags: fc.array(fc.string({ minLength: 1, maxLength: 50 }), { maxLength: 10 }),
          companies: fc.array(fc.string({ minLength: 1, maxLength: 50 }), { maxLength: 10 }),
          acceptance: fc.float({ min: 0, max: 100 }),
          timeLimit: fc.integer({ min: 1000, max: 10000 }),
          memoryLimit: fc.integer({ min: 128, max: 512 }),
        }),
        async (problemData) => {
          // Create a problem with the generated data
          const problem = await CodingProblem.create(problemData);

          // Verify all required fields are present
          expect(problem.id).toBeDefined();
          expect(problem.title).toBe(problemData.title);
          expect(problem.difficulty).toBe(problemData.difficulty);
          expect(problem.description).toBe(problemData.description);
          expect(problem.constraints).toEqual(problemData.constraints);
          expect(problem.examples).toEqual(problemData.examples);
          expect(problem.hints).toEqual(problemData.hints);
          expect(problem.tags).toEqual(problemData.tags);
          expect(problem.companies).toEqual(problemData.companies);
          expect(problem.acceptance).toBe(problemData.acceptance);
          expect(problem.timeLimit).toBe(problemData.timeLimit);
          expect(problem.memoryLimit).toBe(problemData.memoryLimit);
          expect(problem.createdAt).toBeDefined();
          expect(problem.updatedAt).toBeDefined();

          // Verify the problem can be retrieved with all fields
          const retrieved = await CodingProblem.findByPk(problem.id);
          expect(retrieved).not.toBeNull();
          expect(retrieved.title).toBe(problemData.title);
          expect(retrieved.difficulty).toBe(problemData.difficulty);
          expect(retrieved.description).toBe(problemData.description);
          expect(retrieved.constraints).toEqual(problemData.constraints);
          expect(retrieved.examples).toEqual(problemData.examples);
          expect(retrieved.companies).toEqual(problemData.companies);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Problem model enforces required fields', async () => {
    // Test that required fields cannot be null
    await expect(
      CodingProblem.create({
        difficulty: 'Easy',
        description: 'Test description',
      })
    ).rejects.toThrow();

    await expect(
      CodingProblem.create({
        title: 'Test Problem',
        description: 'Test description',
      })
    ).rejects.toThrow();

    await expect(
      CodingProblem.create({
        title: 'Test Problem',
        difficulty: 'Easy',
      })
    ).rejects.toThrow();
  });

  test('Problem model sets default values correctly', async () => {
    const problem = await CodingProblem.create({
      title: 'Test Problem',
      difficulty: 'Easy',
      description: 'Test description',
    });

    expect(problem.constraints).toEqual([]);
    expect(problem.examples).toEqual([]);
    expect(problem.hints).toEqual([]);
    expect(problem.tags).toEqual([]);
    expect(problem.companies).toEqual([]);
    expect(problem.timeLimit).toBe(2000);
    expect(problem.memoryLimit).toBe(256);
  });
});
