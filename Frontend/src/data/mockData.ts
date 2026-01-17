// Mock data for the LMS platform

export const studentDashboardData = {
  skillReadiness: 72,
  codingProgress: 68,
  softSkillsProgress: 75,
  behavioralScore: 80,
  upcomingAssessments: [
    { id: 1, title: 'Data Structures Quiz', type: 'coding', date: '2024-01-15', time: '10:00 AM' },
    { id: 2, title: 'Business Communication', type: 'writing', date: '2024-01-16', time: '2:00 PM' },
    { id: 3, title: 'Group Discussion', type: 'speaking', date: '2024-01-18', time: '11:00 AM' },
  ],
  recentActivities: [
    { id: 1, action: 'Completed', item: 'Array Problems Set', time: '2 hours ago', score: 85 },
    { id: 2, action: 'Submitted', item: 'Email Writing Task', time: '5 hours ago', score: 78 },
    { id: 3, action: 'Attempted', item: 'Mock Interview', time: '1 day ago', score: 72 },
  ],
  aiRecommendations: [
    { id: 1, type: 'coding', title: 'Practice Dynamic Programming', priority: 'high' },
    { id: 2, type: 'speaking', title: 'Work on pronunciation clarity', priority: 'medium' },
    { id: 3, type: 'writing', title: 'Improve email structuring', priority: 'low' },
  ],
  skillBreakdown: [
    { skill: 'Coding', score: 68, trend: 'up' },
    { skill: 'Writing', score: 75, trend: 'up' },
    { skill: 'Reading', score: 82, trend: 'stable' },
    { skill: 'Speaking', score: 70, trend: 'up' },
    { skill: 'Behavior', score: 80, trend: 'stable' },
  ],
  weeklyProgress: [
    { day: 'Mon', coding: 45, softSkills: 30 },
    { day: 'Tue', coding: 60, softSkills: 45 },
    { day: 'Wed', coding: 30, softSkills: 60 },
    { day: 'Thu', coding: 75, softSkills: 50 },
    { day: 'Fri', coding: 55, softSkills: 70 },
    { day: 'Sat', coding: 80, softSkills: 40 },
    { day: 'Sun', coding: 20, softSkills: 25 },
  ],
};

export const codingProblems = [
  {
    id: 1,
    title: 'Two Sum',
    difficulty: 'Easy',
    tags: ['Array', 'Hash Map'],
    companies: ['Google', 'Amazon', 'Facebook'],
    acceptance: 48.2,
    solved: true,
  },
  {
    id: 2,
    title: 'Longest Substring Without Repeating Characters',
    difficulty: 'Medium',
    tags: ['String', 'Sliding Window'],
    companies: ['Amazon', 'Bloomberg'],
    acceptance: 33.8,
    solved: false,
  },
  {
    id: 3,
    title: 'Merge K Sorted Lists',
    difficulty: 'Hard',
    tags: ['Linked List', 'Divide and Conquer', 'Heap'],
    companies: ['Facebook', 'Microsoft'],
    acceptance: 47.4,
    solved: false,
  },
  {
    id: 4,
    title: 'Valid Parentheses',
    difficulty: 'Easy',
    tags: ['String', 'Stack'],
    companies: ['Google', 'Amazon'],
    acceptance: 40.7,
    solved: true,
  },
  {
    id: 5,
    title: 'Binary Tree Level Order Traversal',
    difficulty: 'Medium',
    tags: ['Tree', 'BFS'],
    companies: ['Microsoft', 'Apple'],
    acceptance: 62.5,
    solved: false,
  },
];

export const leaderboardData = [
  { rank: 1, name: 'Arun Kumar', college: 'IIT Delhi', score: 2850, badges: 12, avatar: 'AK' },
  { rank: 2, name: 'Priya Singh', college: 'IIT Bombay', score: 2720, badges: 10, avatar: 'PS' },
  { rank: 3, name: 'Rahul Sharma', college: 'IIT Delhi', score: 2680, badges: 9, avatar: 'RS' },
  { rank: 4, name: 'Sneha Patel', college: 'NIT Trichy', score: 2540, badges: 8, avatar: 'SP' },
  { rank: 5, name: 'Vikram Reddy', college: 'BITS Pilani', score: 2490, badges: 7, avatar: 'VR' },
];

export const collegeAnalytics = {
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
    { id: 1, name: 'Student A', score: 45, riskLevel: 'high' },
    { id: 2, name: 'Student B', score: 48, riskLevel: 'high' },
    { id: 3, name: 'Student C', score: 52, riskLevel: 'medium' },
  ],
};

export const facultyData = {
  pendingReviews: 12,
  activeBatches: 4,
  totalStudents: 180,
  upcomingSessions: [
    { id: 1, title: 'DSA Fundamentals', batch: 'CSE 2024 A', time: 'Today, 2:00 PM' },
    { id: 2, title: 'Communication Skills', batch: 'CSE 2024 B', time: 'Tomorrow, 10:00 AM' },
  ],
  recentSubmissions: [
    { id: 1, student: 'Rahul S.', assignment: 'Array Problems', submitted: '2 hours ago', status: 'pending' },
    { id: 2, student: 'Priya P.', assignment: 'Email Writing', submitted: '4 hours ago', status: 'pending' },
    { id: 3, student: 'Arun K.', assignment: 'SQL Queries', submitted: '1 day ago', status: 'reviewed' },
  ],
  batchProgress: [
    { batch: 'CSE 2024 A', progress: 68, students: 45 },
    { batch: 'CSE 2024 B', progress: 72, students: 48 },
    { batch: 'ECE 2024', progress: 55, students: 42 },
    { batch: 'IT 2024', progress: 61, students: 45 },
  ],
};

export const superAdminData = {
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
