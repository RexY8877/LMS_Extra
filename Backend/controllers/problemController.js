const CodingProblem = require('../models/CodingProblem');
const TestCase = require('../models/TestCase');
const SolutionTemplate = require('../models/SolutionTemplate');
const Submission = require('../models/Submission');

// @desc    Get all problems with filtering and sorting
// @route   GET /api/problems
// @access  Public
exports.getProblems = async (req, res) => {
  try {
    const { difficulty, tags, search, sortBy } = req.query;

    // Build filter object for MongoDB
    const filter = {};

    // Filter by difficulty
    if (difficulty && difficulty !== 'All') {
      filter.difficulty = difficulty;
    }

    // Filter by tags (problems with at least one matching tag)
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      filter.tags = { $in: tagArray };
    }

    // Search by title
    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }

    // Build sort object for MongoDB
    let sort = { createdAt: -1 }; // Default sort

    if (sortBy) {
      switch (sortBy) {
        case 'difficulty':
          // Custom order: Easy, Medium, Hard
          sort = { difficulty: 1 };
          break;
        case 'acceptance':
          sort = { acceptance: -1 };
          break;
        case 'title':
          sort = { title: 1 };
          break;
        default:
          sort = { createdAt: -1 };
      }
    }

    const problems = await CodingProblem.find(filter)
      .sort(sort)
      .select('_id title difficulty acceptance tags companies');

    res.json({ problems });
  } catch (error) {
    console.error('Error fetching problems:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get problem by ID with details
// @route   GET /api/problems/:id
// @access  Public
exports.getProblemById = async (req, res) => {
  try {
    const { id } = req.params;

    const problem = await CodingProblem.findById(id);

    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    // Get example test cases
    const exampleTestCases = await TestCase.find({ 
      problemId: id, 
      isExample: true 
    });

    res.json({ 
      problem: {
        ...problem.toObject(),
        TestCases: exampleTestCases
      }
    });
  } catch (error) {
    console.error('Error fetching problem:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get solution template for a problem
// @route   GET /api/problems/:id/template
// @access  Public
exports.getProblemTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const { language } = req.query;

    if (!language) {
      return res.status(400).json({ message: 'Language parameter is required' });
    }

    // Check if problem exists
    const problem = await CodingProblem.findById(id);
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    // Try to find existing template
    let template = await SolutionTemplate.findOne({
      problemId: id,
      language: language
    });

    // If no template exists, generate a default one
    if (!template) {
      const defaultTemplate = generateDefaultTemplate(language, problem.title);
      template = {
        template: defaultTemplate.template,
        functionSignature: defaultTemplate.functionSignature
      };
    }

    res.json({ 
      template: template.template,
      functionSignature: template.functionSignature
    });
  } catch (error) {
    console.error('Error fetching template:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Helper function to generate default templates
function generateDefaultTemplate(language, problemTitle) {
  const functionName = 'solution';
  
  switch (language.toLowerCase()) {
    case 'python':
      return {
        template: `def ${functionName}():\n    # Write your solution here\n    pass\n`,
        functionSignature: `def ${functionName}():`
      };
    
    case 'javascript':
      return {
        template: `/**\n * @return {void}\n */\nfunction ${functionName}() {\n    // Write your solution here\n}\n\nmodule.exports = ${functionName};\n`,
        functionSignature: `function ${functionName}()`
      };
    
    case 'java':
      return {
        template: `class Solution {\n    public void solution() {\n        // Write your solution here\n    }\n}\n`,
        functionSignature: `public void solution()`
      };
    
    default:
      return {
        template: `// Write your solution here\n`,
        functionSignature: `function ${functionName}()`
      };
  }
}

// @desc    Get problem statistics (average runtime and memory)
// @route   GET /api/problems/:id/stats
// @access  Public
exports.getProblemStats = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if problem exists
    const problem = await CodingProblem.findById(id);
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    // Get all accepted submissions for this problem
    const acceptedSubmissions = await Submission.find({
      problemId: id,
      status: 'Accepted',
      runtime: { $ne: null },
      memory: { $ne: null }
    }).select('runtime memory');

    // Calculate statistics
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
