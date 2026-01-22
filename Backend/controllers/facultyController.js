const FacultyData = require('../models/FacultyData');
const Batch = require('../models/Batch');
const Session = require('../models/Session');
const AssignmentSubmission = require('../models/AssignmentSubmission');
const Assignment = require('../models/Assignment');
const BatchStudent = require('../models/BatchStudent');
const User = require('../models/User');
const StudentProgress = require('../models/StudentProgress');

// @desc    Get faculty dashboard data
// @route   GET /api/faculty/dashboard
// @access  Private (Faculty)
const getFacultyDashboard = async (req, res) => {
  try {
    const facultyId = req.user.id;

    // Get total students count for faculty
    const activeBatches = await Batch.find({ 
      facultyId, 
      status: 'active' 
    }).select('_id');
    
    const batchIds = activeBatches.map(batch => batch._id);
    
    const totalStudents = await BatchStudent.countDocuments({
      batchId: { $in: batchIds },
      status: 'active'
    });

    // Get active batches count
    const activeBatchesCount = activeBatches.length;

    // Get pending reviews count (ungraded submissions)
    const facultyAssignments = await Assignment.find({ 
      createdBy: facultyId 
    }).select('_id');
    
    const assignmentIds = facultyAssignments.map(assignment => assignment._id);
    
    const pendingReviews = await AssignmentSubmission.countDocuments({
      assignmentId: { $in: assignmentIds },
      status: 'pending'
    });

    // Get upcoming sessions count (next 7 days)
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const upcomingSessions = await Session.countDocuments({
      facultyId,
      status: 'scheduled',
      date: { 
        $gte: new Date(),
        $lte: nextWeek
      }
    });

    // Get recent activity (last 10 activities)
    const recentActivity = [];
    
    // Recent submissions
    const recentSubmissions = await AssignmentSubmission.find({
      assignmentId: { $in: assignmentIds }
    })
    .populate('studentId', 'name')
    .populate('assignmentId', 'title')
    .sort({ submittedAt: -1 })
    .limit(5);

    recentSubmissions.forEach(submission => {
      recentActivity.push({
        type: 'submission',
        message: `${submission.studentId.name} submitted ${submission.assignmentId.title}`,
        timestamp: submission.submittedAt,
        studentName: submission.studentId.name,
        assignmentTitle: submission.assignmentId.title
      });
    });

    // Recent sessions
    const recentSessions = await Session.find({
      facultyId,
      date: { $lte: new Date() }
    })
    .sort({ date: -1 })
    .limit(3);

    recentSessions.forEach(session => {
      recentActivity.push({
        type: 'session',
        message: `Conducted session: ${session.title}`,
        timestamp: session.date,
        sessionTitle: session.title
      });
    });

    // Sort all activities by timestamp
    recentActivity.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const limitedActivity = recentActivity.slice(0, 10);

    const dashboardData = {
      stats: {
        totalStudents,
        activeBatches: activeBatchesCount,
        pendingReviews,
        upcomingSessions
      },
      recentActivity: limitedActivity,
      alerts: [], // Can be populated with system alerts later
      upcomingSessions: [] // Can be populated with detailed session info later
    };

    res.json(dashboardData);
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get students for faculty's batches
// @route   GET /api/faculty/students
// @access  Private (Faculty)
const getFacultyStudents = async (req, res) => {
  try {
    const facultyId = req.user.id;
    const { 
      batchId, 
      performanceLevel, 
      search, 
      sortBy = 'name',
      sortOrder = 'asc',
      page = 1,
      limit = 50
    } = req.query;

    // Get faculty's batches
    let batchFilter = { facultyId, status: 'active' };
    if (batchId) {
      batchFilter._id = batchId;
    }

    const facultyBatches = await Batch.find(batchFilter).select('_id name');
    const batchIds = facultyBatches.map(batch => batch._id);

    if (batchIds.length === 0) {
      return res.json({ students: [], totalCount: 0, batches: [] });
    }

    // Build student filter
    let studentFilter = {
      batchId: { $in: batchIds },
      status: 'active'
    };

    // Get batch students
    const batchStudents = await BatchStudent.find(studentFilter)
      .populate('studentId', 'name email')
      .populate('batchId', 'name');

    const studentIds = batchStudents.map(bs => bs.studentId._id);

    // Build progress filter
    let progressFilter = { userId: { $in: studentIds } };
    if (performanceLevel) {
      progressFilter.performanceLevel = performanceLevel;
    }

    // Get student progress data
    const studentProgressData = await StudentProgress.find(progressFilter);
    
    // Create a map for quick lookup
    const progressMap = new Map();
    studentProgressData.forEach(progress => {
      progressMap.set(progress.userId.toString(), progress);
    });

    // Build student list with all required information
    let students = [];
    
    for (const batchStudent of batchStudents) {
      const student = batchStudent.studentId;
      const batch = batchStudent.batchId;
      const progress = progressMap.get(student._id.toString()) || {
        overallProgress: 0,
        performanceLevel: 'At Risk',
        lastActivityAt: null,
        batchRank: null
      };

      const studentData = {
        id: student._id,
        name: student.name,
        email: student.email,
        batch: {
          id: batch._id,
          name: batch.name
        },
        progress: {
          overall: progress.overallProgress || 0,
          coding: progress.codingProgress || 0,
          writing: progress.writingProgress || 0,
          reading: progress.readingProgress || 0,
          speaking: progress.speakingProgress || 0,
          behavioral: progress.behavioralProgress || 0
        },
        performanceLevel: progress.performanceLevel || 'At Risk',
        lastActivity: progress.lastActivityAt || batchStudent.enrolledAt,
        batchRank: progress.batchRank,
        assignmentsCompleted: progress.assignmentsCompleted || 0,
        totalAssignments: progress.totalAssignments || 0,
        averageGrade: progress.averageGrade || 0,
        attendanceRate: progress.attendanceRate || 0,
        enrolledAt: batchStudent.enrolledAt
      };

      students.push(studentData);
    }

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      students = students.filter(student => 
        student.name.toLowerCase().includes(searchLower) ||
        student.email.toLowerCase().includes(searchLower) ||
        student.batch.name.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    students.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'progress':
          aValue = a.progress.overall;
          bValue = b.progress.overall;
          break;
        case 'lastActivity':
          aValue = new Date(a.lastActivity);
          bValue = new Date(b.lastActivity);
          break;
        case 'batch':
          aValue = a.batch.name.toLowerCase();
          bValue = b.batch.name.toLowerCase();
          break;
        case 'performanceLevel':
          // Custom sort order for performance levels
          const levelOrder = { 'Excellent': 4, 'Good': 3, 'Needs Improvement': 2, 'At Risk': 1 };
          aValue = levelOrder[a.performanceLevel] || 0;
          bValue = levelOrder[b.performanceLevel] || 0;
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (sortOrder === 'desc') {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      } else {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      }
    });

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedStudents = students.slice(startIndex, endIndex);

    // Prepare batch list for filtering
    const batchList = facultyBatches.map(batch => ({
      id: batch._id,
      name: batch.name
    }));

    res.json({
      students: paginatedStudents,
      totalCount: students.length,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(students.length / limit),
      batches: batchList,
      filters: {
        batchId: batchId || null,
        performanceLevel: performanceLevel || null,
        search: search || null,
        sortBy,
        sortOrder
      }
    });

  } catch (error) {
    console.error('Get faculty students error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getFacultyDashboard, getFacultyStudents };
