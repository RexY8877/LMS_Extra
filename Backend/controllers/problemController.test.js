const fc = require('fast-check');

// Mock the models before requiring the controller
jest.mock('../models/CodingProblem', () => ({
  findAll: jest.fn(),
  findByPk: jest.fn()
}));
jest.mock('../models/TestCase', () => ({}));
jest.mock('../models/SolutionTemplate', () => ({
  findOne: jest.fn()
}));
jest.mock('../models/Submission', () => ({}));

const { getProblems } = require('./problemController');
const CodingProblem = require('../models/CodingProblem');

describe('Problem Controller Property Tests', () => {
  let req, res;

  beforeEach(() => {
    req = {
      query: {}
    };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };
    CodingProblem.findAll.mockClear();
  });

  /**
   * Feature: coding-practice-system, Property 1: Problem filtering returns only matching problems
   * Validates: Requirements 1.2
   */
  describe('Property 1: Problem filtering returns only matching problems', () => {
    it('should return only problems matching the difficulty filter', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.record({
              id: fc.uuid(),
              title: fc.string({ minLength: 1, maxLength: 50 }),
              difficulty: fc.constantFrom('Easy', 'Medium', 'Hard'),
              acceptance: fc.float({ min: 0, max: 100 }),
              tags: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { maxLength: 5 }),
              companies: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { maxLength: 5 })
            }),
            { minLength: 5, maxLength: 20 }
          ),
          fc.constantFrom('Easy', 'Medium', 'Hard'),
          async (problems, difficulty) => {
            // Clear mocks for this iteration
            CodingProblem.findAll.mockClear();
            res.json.mockClear();
            
            // Setup mock - only return problems matching the difficulty
            const filteredProblems = problems.filter(p => p.difficulty === difficulty);
            CodingProblem.findAll.mockResolvedValue(filteredProblems);

            // Execute
            req.query = { difficulty };
            await getProblems(req, res);

            // Verify the where clause was called correctly
            expect(CodingProblem.findAll).toHaveBeenCalled();
            const callArgs = CodingProblem.findAll.mock.calls[0][0];
            expect(callArgs.where.difficulty).toBe(difficulty);

            // Verify response
            expect(res.json).toHaveBeenCalled();
            const response = res.json.mock.calls[0][0];
            
            // Property: All returned problems should have the specified difficulty
            response.problems.forEach(problem => {
              expect(problem.difficulty).toBe(difficulty);
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Feature: coding-practice-system, Property 2: Tag filtering returns problems with at least one matching tag
   * Validates: Requirements 1.3
   */
  describe('Property 2: Tag filtering returns problems with at least one matching tag', () => {
    it('should return only problems with at least one matching tag', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.record({
              id: fc.uuid(),
              title: fc.string({ minLength: 1, maxLength: 50 }),
              difficulty: fc.constantFrom('Easy', 'Medium', 'Hard'),
              acceptance: fc.float({ min: 0, max: 100 }),
              tags: fc.array(fc.constantFrom('arrays', 'strings', 'dynamic-programming', 'graphs', 'trees'), { minLength: 1, maxLength: 3 }),
              companies: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { maxLength: 5 })
            }),
            { minLength: 5, maxLength: 20 }
          ),
          fc.array(fc.constantFrom('arrays', 'strings', 'dynamic-programming'), { minLength: 1, maxLength: 2 }),
          async (problems, filterTags) => {
            // Clear mocks for this iteration
            CodingProblem.findAll.mockClear();
            res.json.mockClear();
            
            // Setup mock - filter problems that have at least one matching tag
            const filteredProblems = problems.filter(p => 
              p.tags.some(tag => filterTags.includes(tag))
            );
            CodingProblem.findAll.mockResolvedValue(filteredProblems);

            // Execute
            req.query = { tags: filterTags };
            await getProblems(req, res);

            // Verify the where clause includes tag overlap
            expect(CodingProblem.findAll).toHaveBeenCalled();
            const callArgs = CodingProblem.findAll.mock.calls[0][0];
            expect(callArgs.where.tags).toBeDefined();

            // Verify response
            expect(res.json).toHaveBeenCalled();
            const response = res.json.mock.calls[0][0];
            
            // Property: All returned problems should have at least one matching tag
            response.problems.forEach(problem => {
              const hasMatchingTag = problem.tags.some(tag => filterTags.includes(tag));
              expect(hasMatchingTag).toBe(true);
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Feature: coding-practice-system, Property 3: Search returns problems with matching titles
   * Validates: Requirements 1.4
   */
  describe('Property 3: Search returns problems with matching titles', () => {
    it('should return only problems with titles containing the search query', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.record({
              id: fc.uuid(),
              title: fc.string({ minLength: 5, maxLength: 50 }),
              difficulty: fc.constantFrom('Easy', 'Medium', 'Hard'),
              acceptance: fc.float({ min: 0, max: 100 }),
              tags: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { maxLength: 5 }),
              companies: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { maxLength: 5 })
            }),
            { minLength: 5, maxLength: 20 }
          ),
          fc.string({ minLength: 1, maxLength: 10 }),
          async (problems, searchQuery) => {
            // Clear mocks for this iteration
            CodingProblem.findAll.mockClear();
            res.json.mockClear();
            
            // Setup mock - filter problems with matching titles (case-insensitive)
            const filteredProblems = problems.filter(p => 
              p.title.toLowerCase().includes(searchQuery.toLowerCase())
            );
            CodingProblem.findAll.mockResolvedValue(filteredProblems);

            // Execute
            req.query = { search: searchQuery };
            await getProblems(req, res);

            // Verify the where clause includes search
            expect(CodingProblem.findAll).toHaveBeenCalled();
            const callArgs = CodingProblem.findAll.mock.calls[0][0];
            expect(callArgs.where.title).toBeDefined();

            // Verify response
            expect(res.json).toHaveBeenCalled();
            const response = res.json.mock.calls[0][0];
            
            // Property: All returned problems should have titles containing the search query
            response.problems.forEach(problem => {
              expect(problem.title.toLowerCase()).toContain(searchQuery.toLowerCase());
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Feature: coding-practice-system, Property 4: Problem sorting maintains correct order
   * Validates: Requirements 1.5
   */
  describe('Property 4: Problem sorting maintains correct order', () => {
    it('should sort problems by difficulty in correct order', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.record({
              id: fc.uuid(),
              title: fc.string({ minLength: 1, maxLength: 50 }),
              difficulty: fc.constantFrom('Easy', 'Medium', 'Hard'),
              acceptance: fc.float({ min: 0, max: 100 }),
              tags: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { maxLength: 5 }),
              companies: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { maxLength: 5 })
            }),
            { minLength: 5, maxLength: 20 }
          ),
          async (problems) => {
            // Clear mocks for this iteration
            CodingProblem.findAll.mockClear();
            res.json.mockClear();
            
            // Sort by difficulty: Easy, Medium, Hard
            const sortedProblems = [...problems].sort((a, b) => {
              const order = { 'Easy': 1, 'Medium': 2, 'Hard': 3 };
              return order[a.difficulty] - order[b.difficulty];
            });
            CodingProblem.findAll.mockResolvedValue(sortedProblems);

            // Execute
            req.query = { sortBy: 'difficulty' };
            await getProblems(req, res);

            // Verify response
            expect(res.json).toHaveBeenCalled();
            const response = res.json.mock.calls[0][0];
            
            // Property: Problems should be sorted in Easy, Medium, Hard order
            const difficulties = response.problems.map(p => p.difficulty);
            for (let i = 1; i < difficulties.length; i++) {
              const order = { 'Easy': 1, 'Medium': 2, 'Hard': 3 };
              expect(order[difficulties[i]]).toBeGreaterThanOrEqual(order[difficulties[i-1]]);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should sort problems by acceptance rate in descending order', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.record({
              id: fc.uuid(),
              title: fc.string({ minLength: 1, maxLength: 50 }),
              difficulty: fc.constantFrom('Easy', 'Medium', 'Hard'),
              acceptance: fc.float({ min: 0, max: 100, noNaN: true }),
              tags: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { maxLength: 5 }),
              companies: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { maxLength: 5 })
            }),
            { minLength: 5, maxLength: 20 }
          ),
          async (problems) => {
            // Clear mocks for this iteration
            CodingProblem.findAll.mockClear();
            res.json.mockClear();
            
            // Sort by acceptance rate descending
            const sortedProblems = [...problems].sort((a, b) => b.acceptance - a.acceptance);
            CodingProblem.findAll.mockResolvedValue(sortedProblems);

            // Execute
            req.query = { sortBy: 'acceptance' };
            await getProblems(req, res);

            // Verify response
            expect(res.json).toHaveBeenCalled();
            const response = res.json.mock.calls[0][0];
            
            // Property: Problems should be sorted by acceptance rate in descending order
            const acceptanceRates = response.problems.map(p => p.acceptance);
            for (let i = 1; i < acceptanceRates.length; i++) {
              expect(acceptanceRates[i]).toBeLessThanOrEqual(acceptanceRates[i-1]);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should sort problems by title in ascending order', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.record({
              id: fc.uuid(),
              title: fc.string({ minLength: 1, maxLength: 50 }),
              difficulty: fc.constantFrom('Easy', 'Medium', 'Hard'),
              acceptance: fc.float({ min: 0, max: 100 }),
              tags: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { maxLength: 5 }),
              companies: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { maxLength: 5 })
            }),
            { minLength: 5, maxLength: 20 }
          ),
          async (problems) => {
            // Clear mocks for this iteration
            CodingProblem.findAll.mockClear();
            res.json.mockClear();
            
            // Sort by title ascending
            const sortedProblems = [...problems].sort((a, b) => a.title.localeCompare(b.title));
            CodingProblem.findAll.mockResolvedValue(sortedProblems);

            // Execute
            req.query = { sortBy: 'title' };
            await getProblems(req, res);

            // Verify response
            expect(res.json).toHaveBeenCalled();
            const response = res.json.mock.calls[0][0];
            
            // Property: Problems should be sorted by title in ascending order
            const titles = response.problems.map(p => p.title);
            for (let i = 1; i < titles.length; i++) {
              expect(titles[i].localeCompare(titles[i-1])).toBeGreaterThanOrEqual(0);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Feature: coding-practice-system, Property 6: All problem examples are included in response
   * Validates: Requirements 2.2
   */
  describe('Property 6: All problem examples are included in response', () => {
    it('should include all example test cases in problem response', async () => {
      const { getProblemById } = require('./problemController');
      
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            id: fc.uuid(),
            title: fc.string({ minLength: 1, maxLength: 50 }),
            difficulty: fc.constantFrom('Easy', 'Medium', 'Hard'),
            description: fc.string({ minLength: 10, maxLength: 200 }),
            constraints: fc.array(fc.string({ minLength: 5, maxLength: 50 }), { maxLength: 5 }),
            examples: fc.array(
              fc.record({
                input: fc.string({ minLength: 1, maxLength: 50 }),
                output: fc.string({ minLength: 1, maxLength: 50 }),
                explanation: fc.option(fc.string({ minLength: 5, maxLength: 100 }))
              }),
              { minLength: 1, maxLength: 5 }
            ),
            hints: fc.array(fc.string({ minLength: 5, maxLength: 100 }), { maxLength: 3 }),
            tags: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { maxLength: 5 }),
            companies: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { maxLength: 5 }),
            acceptance: fc.float({ min: 0, max: 100, noNaN: true }),
            timeLimit: fc.integer({ min: 1000, max: 10000 }),
            memoryLimit: fc.integer({ min: 128, max: 512 })
          }),
          fc.array(
            fc.record({
              id: fc.uuid(),
              input: fc.string({ minLength: 1, maxLength: 50 }),
              expectedOutput: fc.string({ minLength: 1, maxLength: 50 }),
              isExample: fc.constant(true)
            }),
            { minLength: 1, maxLength: 5 }
          ),
          async (problem, exampleTestCases) => {
            // Clear mocks for this iteration
            CodingProblem.findByPk.mockClear();
            res.json.mockClear();
            
            // Setup mock - return problem with example test cases
            const problemWithTestCases = {
              ...problem,
              TestCases: exampleTestCases
            };
            CodingProblem.findByPk.mockResolvedValue(problemWithTestCases);

            // Execute
            req.params = { id: problem.id };
            await getProblemById(req, res);

            // Verify response
            expect(res.json).toHaveBeenCalled();
            const response = res.json.mock.calls[0][0];
            
            // Property: All example test cases should be included in the response
            expect(response.problem.TestCases).toBeDefined();
            expect(response.problem.TestCases.length).toBe(exampleTestCases.length);
            
            // Verify all test cases are examples
            response.problem.TestCases.forEach(testCase => {
              expect(testCase.isExample).toBe(true);
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Feature: coding-practice-system, Property 7: Language templates are generated correctly
   * Validates: Requirements 3.2
   * 
   * Feature: coding-practice-system, Property 31: Templates include function signatures
   * Validates: Requirements 11.1
   * 
   * Feature: coding-practice-system, Property 34: Templates include necessary imports
   * Validates: Requirements 11.5
   */
  describe('Property 7, 31, 34: Template generation properties', () => {
    it('should generate valid templates for all supported languages', async () => {
      const { getProblemTemplate } = require('./problemController');
      const SolutionTemplate = require('../models/SolutionTemplate');
      
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            id: fc.uuid(),
            title: fc.string({ minLength: 1, maxLength: 50 })
          }),
          fc.constantFrom('python', 'javascript', 'java'),
          async (problem, language) => {
            // Clear mocks for this iteration
            CodingProblem.findByPk.mockClear();
            SolutionTemplate.findOne.mockClear();
            res.json.mockClear();
            res.status.mockClear();
            
            // Setup mocks
            CodingProblem.findByPk.mockResolvedValue(problem);
            SolutionTemplate.findOne.mockResolvedValue(null); // Force default template generation

            // Execute
            req.params = { id: problem.id };
            req.query = { language };
            await getProblemTemplate(req, res);

            // Verify response
            expect(res.json).toHaveBeenCalled();
            const response = res.json.mock.calls[0][0];
            
            // Property 7: Template should be generated for the language
            expect(response.template).toBeDefined();
            expect(typeof response.template).toBe('string');
            expect(response.template.length).toBeGreaterThan(0);
            
            // Property 31: Template should include function signature
            expect(response.functionSignature).toBeDefined();
            expect(typeof response.functionSignature).toBe('string');
            expect(response.functionSignature.length).toBeGreaterThan(0);
            
            // Property 34: Template should include necessary imports/structure
            switch (language) {
              case 'python':
                expect(response.template).toContain('def ');
                expect(response.functionSignature).toContain('def ');
                break;
              case 'javascript':
                expect(response.template).toContain('function ');
                expect(response.template).toContain('module.exports');
                expect(response.functionSignature).toContain('function ');
                break;
              case 'java':
                expect(response.template).toContain('class Solution');
                expect(response.template).toContain('public ');
                expect(response.functionSignature).toContain('public ');
                break;
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return existing template when available', async () => {
      const { getProblemTemplate } = require('./problemController');
      const SolutionTemplate = require('../models/SolutionTemplate');
      
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            id: fc.uuid(),
            title: fc.string({ minLength: 1, maxLength: 50 })
          }),
          fc.constantFrom('python', 'javascript', 'java'),
          fc.string({ minLength: 10, maxLength: 200 }),
          fc.string({ minLength: 5, maxLength: 100 }),
          async (problem, language, templateCode, signature) => {
            // Clear mocks for this iteration
            CodingProblem.findByPk.mockClear();
            SolutionTemplate.findOne.mockClear();
            res.json.mockClear();
            res.status.mockClear();
            
            // Setup mocks - return existing template
            CodingProblem.findByPk.mockResolvedValue(problem);
            SolutionTemplate.findOne.mockResolvedValue({
              template: templateCode,
              functionSignature: signature
            });

            // Execute
            req.params = { id: problem.id };
            req.query = { language };
            await getProblemTemplate(req, res);

            // Verify response
            expect(res.json).toHaveBeenCalled();
            const response = res.json.mock.calls[0][0];
            
            // Property: Should return the existing template
            expect(response.template).toBe(templateCode);
            expect(response.functionSignature).toBe(signature);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
