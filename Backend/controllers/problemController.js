const CodingProblem = require('../models/CodingProblem');
const TestCase = require('../models/TestCase');
const SolutionTemplate = require('../models/SolutionTemplate');
const Submission = require('../models/Submission');
const sequelize = require('../config/db');
const { Op } = require('sequelize');

// @desc    Get all problems with filtering and sorting
// @route   GET /api/problems
// @access  Public
exports.getProblems = async (req, res) => {
  try {
    const { difficulty, tags, search, sortBy } = req.query;

    // Build where clause for filtering
    const whereClause = {};

    // Filter by difficulty
    if (difficulty && difficulty !== 'All') {
      whereClause.difficulty = difficulty;
    }

    // Filter by tags (problems with at least one matching tag)
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      whereClause.tags = {
        [Op.overlap]: tagArray
      };
    }

    // Search by title
    if (search) {
      whereClause.title = {
        [Op.iLike]: `%${search}%`
      };
    }

    // Build order clause for sorting
    let orderClause = [['createdAt', 'DESC']]; // Default sort

    if (sortBy) {
      switch (sortBy) {
        case 'difficulty':
          // Custom order: Easy, Medium, Hard
          orderClause = [
            [sequelize.literal(`CASE difficulty WHEN 'Easy' THEN 1 WHEN 'Medium' THEN 2 WHEN 'Hard' THEN 3 END`), 'ASC']
          ];
          break;
        case 'acceptance':
          orderClause = [['acceptance', 'DESC']];
          break;
        case 'title':
          orderClause = [['title', 'ASC']];
          break;
        default:
          orderClause = [['createdAt', 'DESC']];
      }
    }

    const problems = await CodingProblem.findAll({
      where: whereClause,
      order: orderClause,
      attributes: ['id', 'title', 'difficulty', 'acceptance', 'tags', 'companies']
    });

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

    const problem = await CodingProblem.findByPk(id, {
      include: [
        {
          model: TestCase,
          where: { isExample: true },
          required: false
        }
      ]
    });

    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    res.json({ problem });
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
    const problem = await CodingProblem.findByPk(id);
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    // Try to find existing template
    let template = await SolutionTemplate.findOne({
      where: {
        problemId: id,
        language: language
      }
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
    const problem = await CodingProblem.findByPk(id);
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    // Get all accepted submissions for this problem
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
