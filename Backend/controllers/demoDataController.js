const {
  demoStudentData,
  demoFacultyData,
  demoCollegeData,
  demoPlatformData,
  demoCodingProblems,
  demoLeaderboard,
} = require('../data/demoData');

// Student Dashboard Data
const getStudentDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Check if this is a demo user
    if (userId.startsWith('demo_')) {
      const studentData = demoStudentData[userId];
      if (studentData) {
        res.json(studentData);
      } else {
        res.status(404).json({ message: 'Demo student data not found' });
      }
      return;
    }

    // For real users, you would fetch from MongoDB here
    // const studentData = await StudentData.findOne({ userId });
    res.status(501).json({ message: 'Real user data not implemented yet' });
  } catch (error) {
    console.error('Get student dashboard error:', error);
    res.status(500).json({ message: 'Server error getting student dashboard' });
  }
};

// Faculty Dashboard Data
const getFacultyDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Check if this is a demo user
    if (userId.startsWith('demo_')) {
      const facultyData = demoFacultyData[userId];
      if (facultyData) {
        res.json(facultyData);
      } else {
        res.status(404).json({ message: 'Demo faculty data not found' });
      }
      return;
    }

    // For real users, you would fetch from MongoDB here
    res.status(501).json({ message: 'Real user data not implemented yet' });
  } catch (error) {
    console.error('Get faculty dashboard error:', error);
    res.status(500).json({ message: 'Server error getting faculty dashboard' });
  }
};

// College Analytics Data
const getCollegeAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Check if this is a demo user
    if (userId.startsWith('demo_')) {
      // For demo users, return IIT Delhi data
      const collegeData = demoCollegeData['IIT Delhi'];
      if (collegeData) {
        res.json(collegeData);
      } else {
        res.status(404).json({ message: 'Demo college data not found' });
      }
      return;
    }

    // For real users, you would fetch from MongoDB here
    res.status(501).json({ message: 'Real user data not implemented yet' });
  } catch (error) {
    console.error('Get college analytics error:', error);
    res.status(500).json({ message: 'Server error getting college analytics' });
  }
};

// Platform Analytics Data (Super Admin)
const getPlatformAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Check if this is a demo user
    if (userId.startsWith('demo_')) {
      res.json(demoPlatformData);
      return;
    }

    // For real users, you would fetch from MongoDB here
    res.status(501).json({ message: 'Real user data not implemented yet' });
  } catch (error) {
    console.error('Get platform analytics error:', error);
    res.status(500).json({ message: 'Server error getting platform analytics' });
  }
};

// Coding Problems
const getCodingProblems = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // For demo users, return demo problems
    if (userId.startsWith('demo_')) {
      res.json(demoCodingProblems);
      return;
    }

    // For real users, you would fetch from MongoDB here
    res.status(501).json({ message: 'Real user data not implemented yet' });
  } catch (error) {
    console.error('Get coding problems error:', error);
    res.status(500).json({ message: 'Server error getting coding problems' });
  }
};

// Get specific coding problem
const getCodingProblem = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // For demo users, return demo problem
    if (userId.startsWith('demo_')) {
      const problem = demoCodingProblems.find(p => p.id === parseInt(id));
      if (problem) {
        res.json(problem);
      } else {
        res.status(404).json({ message: 'Problem not found' });
      }
      return;
    }

    // For real users, you would fetch from MongoDB here
    res.status(501).json({ message: 'Real user data not implemented yet' });
  } catch (error) {
    console.error('Get coding problem error:', error);
    res.status(500).json({ message: 'Server error getting coding problem' });
  }
};

// Leaderboard
const getLeaderboard = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // For demo users, return demo leaderboard
    if (userId.startsWith('demo_')) {
      res.json(demoLeaderboard);
      return;
    }

    // For real users, you would fetch from MongoDB here
    res.status(501).json({ message: 'Real user data not implemented yet' });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ message: 'Server error getting leaderboard' });
  }
};

// Submit code (demo implementation)
const submitCode = async (req, res) => {
  try {
    const { problemId, code, language } = req.body;
    const userId = req.user.id;
    
    // For demo users, simulate code submission
    if (userId.startsWith('demo_')) {
      // Simple demo response - in real implementation, this would execute code
      const demoResult = {
        submissionId: `demo_submission_${Date.now()}`,
        status: 'accepted',
        runtime: Math.floor(Math.random() * 100) + 50, // Random runtime 50-150ms
        memory: Math.floor(Math.random() * 20) + 10, // Random memory 10-30MB
        testCasesPassed: Math.floor(Math.random() * 3) + 8, // 8-10 test cases passed
        totalTestCases: 10,
        score: 100,
        submittedAt: new Date().toISOString(),
      };
      
      res.json(demoResult);
      return;
    }

    // For real users, you would process the submission here
    res.status(501).json({ message: 'Real code execution not implemented yet' });
  } catch (error) {
    console.error('Submit code error:', error);
    res.status(500).json({ message: 'Server error submitting code' });
  }
};

module.exports = {
  getStudentDashboard,
  getFacultyDashboard,
  getCollegeAnalytics,
  getPlatformAnalytics,
  getCodingProblems,
  getCodingProblem,
  getLeaderboard,
  submitCode,
};