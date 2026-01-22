// Demo API service - works with or without MongoDB
const API_BASE_URL = 'http://localhost:5000/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const authData = localStorage.getItem('lms-auth');
  if (authData) {
    const { state } = JSON.parse(authData);
    if (state?.user?.token) {
      return {
        'Authorization': `Bearer ${state.user.token}`,
        'Content-Type': 'application/json',
      };
    }
  }
  return {
    'Content-Type': 'application/json',
  };
};

// Generic API call function
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: getAuthHeaders(),
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API call failed: ${response.statusText}`);
  }

  return response.json();
};

// Student API calls
export const studentApi = {
  getDashboard: () => apiCall('/demo/student/dashboard'),
};

// Faculty API calls
export const facultyApi = {
  getDashboard: () => apiCall('/demo/faculty/dashboard'),
};

// College Admin API calls
export const collegeApi = {
  getAnalytics: () => apiCall('/demo/college/analytics'),
};

// Super Admin API calls
export const platformApi = {
  getAnalytics: () => apiCall('/demo/platform/analytics'),
};

// Coding Practice API calls
export const codingApi = {
  getProblems: () => apiCall('/demo/coding/problems'),
  getProblem: (id: number) => apiCall(`/demo/coding/problems/${id}`),
  submitCode: (data: { problemId: number; code: string; language: string }) =>
    apiCall('/demo/coding/submit', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Leaderboard API calls
export const leaderboardApi = {
  getLeaderboard: () => apiCall('/demo/leaderboard'),
};

// Generic data fetcher hook-compatible functions
export const fetchStudentDashboard = async () => {
  try {
    return await studentApi.getDashboard();
  } catch (error) {
    console.error('Failed to fetch student dashboard:', error);
    // Fallback to mock data if API fails
    return {
      skillReadiness: 72,
      codingProgress: 68,
      softSkillsProgress: 75,
      behavioralScore: 80,
      upcomingAssessments: [],
      recentActivities: [],
      aiRecommendations: [],
      skillBreakdown: [],
      weeklyProgress: [],
    };
  }
};

export const fetchFacultyDashboard = async () => {
  try {
    return await facultyApi.getDashboard();
  } catch (error) {
    console.error('Failed to fetch faculty dashboard:', error);
    return {
      pendingReviews: 0,
      activeBatches: 0,
      totalStudents: 0,
      upcomingSessions: [],
      recentSubmissions: [],
      batchProgress: [],
    };
  }
};

export const fetchCollegeAnalytics = async () => {
  try {
    return await collegeApi.getAnalytics();
  } catch (error) {
    console.error('Failed to fetch college analytics:', error);
    return {
      totalStudents: 0,
      activeStudents: 0,
      placementReady: 0,
      averageScore: 0,
      batchWiseData: [],
      skillHeatmap: [],
      highRiskStudents: [],
    };
  }
};

export const fetchPlatformAnalytics = async () => {
  try {
    return await platformApi.getAnalytics();
  } catch (error) {
    console.error('Failed to fetch platform analytics:', error);
    return {
      totalColleges: 0,
      totalStudents: 0,
      totalFaculty: 0,
      platformUsage: { dailyActive: 0, weeklyActive: 0, monthlyActive: 0 },
      collegeComparison: [],
      growthMetrics: [],
    };
  }
};

export const fetchCodingProblems = async () => {
  try {
    return await codingApi.getProblems();
  } catch (error) {
    console.error('Failed to fetch coding problems:', error);
    return [];
  }
};

export const fetchCodingProblem = async (id: number) => {
  try {
    return await codingApi.getProblem(id);
  } catch (error) {
    console.error('Failed to fetch coding problem:', error);
    return null;
  }
};

export const fetchLeaderboard = async () => {
  try {
    return await leaderboardApi.getLeaderboard();
  } catch (error) {
    console.error('Failed to fetch leaderboard:', error);
    return [];
  }
};