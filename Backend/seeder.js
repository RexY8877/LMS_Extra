const connectDB = require('./config/db');
const User = require('./models/User');
const StudentData = require('./models/StudentData');
const FacultyData = require('./models/FacultyData');
const CollegeData = require('./models/CollegeData');
const PlatformData = require('./models/PlatformData');
const CodingProblem = require('./models/CodingProblem');
const Leaderboard = require('./models/Leaderboard');
const seedCodingProblems = require('./seeders/codingProblemsSeeder');
const dotenv = require('dotenv');

dotenv.config();

const importData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany({});
    await StudentData.deleteMany({});
    await FacultyData.deleteMany({});
    await CollegeData.deleteMany({});
    await PlatformData.deleteMany({});
    await CodingProblem.deleteMany({});
    await Leaderboard.deleteMany({});

    console.log('Creating demo users...');

    const users = [];
    const userList = [
      // Main demo credentials (matching frontend)
      {
        name: 'Demo Student',
        email: 'student@demo.com',
        password: 'demo123',
        role: 'student',
        college: 'IIT Delhi',
        department: 'Computer Science',
      },
      {
        name: 'Demo Faculty',
        email: 'faculty@demo.com',
        password: 'demo123',
        role: 'faculty',
        college: 'IIT Delhi',
        department: 'Computer Science',
      },
      // Additional Students
      {
        name: 'Rahul Sharma',
        email: 'student1@demo.com',
        password: 'password123',
        role: 'student',
        college: 'IIT Delhi',
        department: 'Computer Science',
      },
      {
        name: 'Priya Patel',
        email: 'student2@demo.com',
        password: 'password123',
        role: 'student',
        college: 'IIT Delhi',
        department: 'Computer Science',
      },
      {
        name: 'Arjun Kumar',
        email: 'student3@demo.com',
        password: 'password123',
        role: 'student',
        college: 'IIT Delhi',
        department: 'Electronics',
      },
      {
        name: 'Sneha Gupta',
        email: 'student4@demo.com',
        password: 'password123',
        role: 'student',
        college: 'IIT Delhi',
        department: 'Computer Science',
      },
      {
        name: 'Vikram Singh',
        email: 'student5@demo.com',
        password: 'password123',
        role: 'student',
        college: 'IIT Delhi',
        department: 'Information Technology',
      },
      
      // Faculty Members
      {
        name: 'Dr. Priya Patel',
        email: 'faculty1@demo.com',
        password: 'password123',
        role: 'faculty',
        college: 'IIT Delhi',
        department: 'Computer Science',
      },
      {
        name: 'Prof. Rajesh Kumar',
        email: 'faculty2@demo.com',
        password: 'password123',
        role: 'faculty',
        college: 'IIT Delhi',
        department: 'Computer Science',
      },
      {
        name: 'Dr. Anjali Sharma',
        email: 'faculty3@demo.com',
        password: 'password123',
        role: 'faculty',
        college: 'IIT Delhi',
        department: 'Electronics',
      },
      {
        name: 'Prof. Suresh Reddy',
        email: 'faculty4@demo.com',
        password: 'password123',
        role: 'faculty',
        college: 'IIT Delhi',
        department: 'Information Technology',
      },
      
      // Admin Users
      {
        name: 'Demo College Admin',
        email: 'admin@demo.com',
        password: 'demo123',
        role: 'college_admin',
        college: 'IIT Delhi',
      },
      {
        name: 'Demo Super Admin',
        email: 'super@demo.com',
        password: 'demo123',
        role: 'super_admin',
      },
    ];

    for (const user of userList) {
      const createdUser = await User.create(user);
      users.push(createdUser);
      console.log(`Created user: ${user.name} (${user.role}) - ${user.email}`);
    }

    // Create student data for each student
    const students = users.filter(user => user.role === 'student');
    const faculty = users.filter(user => user.role === 'faculty');

    console.log('Creating student dashboard data...');
    
    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      const skillReadiness = Math.floor(Math.random() * 30) + 60; // 60-90
      const codingProgress = Math.floor(Math.random() * 40) + 50; // 50-90
      const softSkillsProgress = Math.floor(Math.random() * 35) + 60; // 60-95
      const behavioralScore = Math.floor(Math.random() * 25) + 70; // 70-95

      const studentDashboardData = {
        userId: student._id,
        skillReadiness,
        codingProgress,
        softSkillsProgress,
        behavioralScore,
        upcomingAssessments: [
          { title: 'Data Structures Quiz', type: 'coding', date: '2024-01-15', time: '10:00 AM' },
          { title: 'Business Communication', type: 'writing', date: '2024-01-16', time: '2:00 PM' },
          { title: 'Group Discussion', type: 'speaking', date: '2024-01-18', time: '11:00 AM' },
        ],
        recentActivities: [
          { action: 'Completed', item: 'Array Problems Set', time: '2 hours ago', score: Math.floor(Math.random() * 30) + 70 },
          { action: 'Submitted', item: 'Email Writing Task', time: '5 hours ago', score: Math.floor(Math.random() * 25) + 70 },
          { action: 'Attempted', item: 'Mock Interview', time: '1 day ago', score: Math.floor(Math.random() * 30) + 65 },
        ],
        aiRecommendations: [
          { type: 'coding', title: 'Practice Dynamic Programming', priority: 'high' },
          { type: 'speaking', title: 'Work on pronunciation clarity', priority: 'medium' },
          { type: 'writing', title: 'Improve email structuring', priority: 'low' },
        ],
        skillBreakdown: [
          { skill: 'Coding', score: codingProgress, trend: 'up' },
          { skill: 'Writing', score: Math.floor(Math.random() * 30) + 65, trend: 'up' },
          { skill: 'Reading', score: Math.floor(Math.random() * 25) + 70, trend: 'stable' },
          { skill: 'Speaking', score: Math.floor(Math.random() * 35) + 60, trend: 'up' },
          { skill: 'Behavior', score: behavioralScore, trend: 'stable' },
        ],
        weeklyProgress: [
          { day: 'Mon', coding: Math.floor(Math.random() * 50) + 30, softSkills: Math.floor(Math.random() * 40) + 30 },
          { day: 'Tue', coding: Math.floor(Math.random() * 50) + 40, softSkills: Math.floor(Math.random() * 40) + 35 },
          { day: 'Wed', coding: Math.floor(Math.random() * 50) + 25, softSkills: Math.floor(Math.random() * 50) + 40 },
          { day: 'Thu', coding: Math.floor(Math.random() * 50) + 50, softSkills: Math.floor(Math.random() * 40) + 40 },
          { day: 'Fri', coding: Math.floor(Math.random() * 50) + 35, softSkills: Math.floor(Math.random() * 50) + 50 },
          { day: 'Sat', coding: Math.floor(Math.random() * 50) + 60, softSkills: Math.floor(Math.random() * 30) + 30 },
          { day: 'Sun', coding: Math.floor(Math.random() * 30) + 15, softSkills: Math.floor(Math.random() * 30) + 20 },
        ],
      };

      await StudentData.create(studentDashboardData);
      console.log(`Created student data for: ${student.name}`);
    }

    console.log('Creating faculty dashboard data...');
    
    for (let i = 0; i < faculty.length; i++) {
      const facultyMember = faculty[i];
      const pendingReviews = Math.floor(Math.random() * 20) + 5; // 5-25
      const activeBatches = Math.floor(Math.random() * 5) + 2; // 2-7
      const totalStudents = Math.floor(Math.random() * 100) + 80; // 80-180
      const upcomingSessions = Math.floor(Math.random() * 8) + 2; // 2-10

      const facultyDashboardData = {
        userId: facultyMember._id,
        pendingReviews,
        activeBatches,
        totalStudents,
        upcomingSessions,
        recentActivity: [
          { action: 'Reviewed', item: 'Array Problems Assignment', time: '2 hours ago' },
          { action: 'Created', item: 'Database Systems Quiz', time: '5 hours ago' },
          { action: 'Uploaded', item: 'React Tutorial Video', time: '1 day ago' },
        ],
        alerts: [
          { type: 'info', message: 'New assignment submissions pending review', count: pendingReviews },
          { type: 'warning', message: 'Upcoming session in 30 minutes', urgent: true },
        ],
        coursesCreated: Math.floor(Math.random() * 10) + 3, // 3-13
        contentUploaded: Math.floor(Math.random() * 50) + 20, // 20-70
        assignmentsCreated: Math.floor(Math.random() * 25) + 10, // 10-35
        averageGradeGiven: Math.floor(Math.random() * 20) + 70, // 70-90
        lastLoginAt: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)) // Within last week
      };

      await FacultyData.create(facultyDashboardData);
      console.log(`Created faculty data for: ${facultyMember.name}`);
    }

    // Create college analytics data
    const collegeAnalytics = {
      collegeName: 'IIT Delhi',
      totalStudents: 2450,
      activeStudents: 2180,
      placementReady: 1560,
      averageScore: 72.5,
      batchWiseData: [
        { batch: '2024', students: 650, avgScore: 75, placementRate: 68 },
        { batch: '2023', students: 720, avgScore: 78, placementRate: 82 },
        { batch: '2022', students: 680, avgScore: 74, placementRate: 88 },
        { batch: '2021', students: 400, avgScore: 71, placementRate: 92 },
      ],
      skillHeatmap: [
        { skill: 'Coding', score: 72 },
        { skill: 'Writing', score: 68 },
        { skill: 'Reading', score: 75 },
        { skill: 'Speaking', score: 65 },
        { skill: 'Behavior', score: 78 },
      ],
      highRiskStudents: [
        { name: 'Student A', score: 45, riskLevel: 'high' },
        { name: 'Student B', score: 48, riskLevel: 'high' },
        { name: 'Student C', score: 52, riskLevel: 'medium' },
      ],
    };

    await CollegeData.create(collegeAnalytics);
    console.log('Created college analytics data');

    // Create super admin platform data
    const superAdminData = {
      totalColleges: 128,
      totalStudents: 52400,
      totalFaculty: 1240,
      platformUsage: {
        dailyActive: 18500,
        weeklyActive: 42000,
        monthlyActive: 51200,
      },
      collegeComparison: [
        { name: 'IIT Delhi', students: 2450, avgScore: 82, placementRate: 94 },
        { name: 'IIT Bombay', students: 2200, avgScore: 85, placementRate: 96 },
        { name: 'NIT Trichy', students: 1800, avgScore: 76, placementRate: 88 },
        { name: 'BITS Pilani', students: 1650, avgScore: 78, placementRate: 90 },
        { name: 'VIT Vellore', students: 3200, avgScore: 72, placementRate: 82 },
      ],
      growthMetrics: [
        { month: 'Jan', users: 42000, colleges: 115 },
        { month: 'Feb', users: 44500, colleges: 118 },
        { month: 'Mar', users: 47200, colleges: 122 },
        { month: 'Apr', users: 49800, colleges: 125 },
        { month: 'May', users: 52400, colleges: 128 },
      ],
    };

    await PlatformData.create(superAdminData);
    console.log('Created platform analytics data');

    // Seed coding problems with test cases and templates
    console.log('Seeding coding problems...');
    await seedCodingProblems();

    // Create leaderboard data
    const leaderboardData = [
      { name: 'Arun Kumar', college: 'IIT Delhi', score: 2850, badges: 12, avatar: 'AK' },
      { name: 'Priya Singh', college: 'IIT Bombay', score: 2720, badges: 10, avatar: 'PS' },
      { name: 'Rahul Sharma', college: 'IIT Delhi', score: 2680, badges: 9, avatar: 'RS' },
      { name: 'Sneha Patel', college: 'NIT Trichy', score: 2540, badges: 8, avatar: 'SP' },
      { name: 'Vikram Reddy', college: 'BITS Pilani', score: 2490, badges: 7, avatar: 'VR' },
      { name: 'Anjali Gupta', college: 'IIT Delhi', score: 2380, badges: 6, avatar: 'AG' },
      { name: 'Kiran Kumar', college: 'NIT Warangal', score: 2290, badges: 5, avatar: 'KK' },
      { name: 'Deepika Rao', college: 'IIIT Hyderabad', score: 2180, badges: 4, avatar: 'DR' },
    ];

    await Leaderboard.insertMany(leaderboardData);
    console.log('Created leaderboard data');

    console.log('\n=== DATA IMPORT COMPLETED ===');
    console.log('\nMain Demo Credentials (Frontend Compatible):');
    console.log('Email: student@demo.com | Password: demo123 | Role: Student');
    console.log('Email: faculty@demo.com | Password: demo123 | Role: Faculty');
    console.log('Email: admin@demo.com | Password: demo123 | Role: College Admin');
    console.log('Email: super@demo.com | Password: demo123 | Role: Super Admin');
    
    console.log('\nAdditional Demo Credentials:');
    console.log('\n--- STUDENTS ---');
    console.log('Email: student1@demo.com | Password: password123 | Name: Rahul Sharma');
    console.log('Email: student2@demo.com | Password: password123 | Name: Priya Patel');
    console.log('Email: student3@demo.com | Password: password123 | Name: Arjun Kumar');
    console.log('Email: student4@demo.com | Password: password123 | Name: Sneha Gupta');
    console.log('Email: student5@demo.com | Password: password123 | Name: Vikram Singh');
    
    console.log('\n--- FACULTY ---');
    console.log('Email: faculty1@demo.com | Password: password123 | Name: Dr. Priya Patel');
    console.log('Email: faculty2@demo.com | Password: password123 | Name: Prof. Rajesh Kumar');
    console.log('Email: faculty3@demo.com | Password: password123 | Name: Dr. Anjali Sharma');
    console.log('Email: faculty4@demo.com | Password: password123 | Name: Prof. Suresh Reddy');
    
    console.log('\n--- ADMINS ---');
    console.log('Email: admin@demo.com | Password: demo123 | Name: Demo College Admin');
    console.log('Email: super@demo.com | Password: demo123 | Name: Demo Super Admin');
    
    console.log('\n=== SETUP INSTRUCTIONS ===');
    console.log('1. Update your .env file with your MongoDB connection string');
    console.log('2. Replace "your-mongodb-host" with your actual MongoDB server address');
    console.log('3. Update username and password in the connection string');
    console.log('4. Run: npm run db:setup');
    console.log('5. Start the server: npm run dev');

    process.exit();
  } catch (error) {
    console.error(`Error importing data: ${error}`);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
};

importData();
