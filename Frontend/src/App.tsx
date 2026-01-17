import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";

// Pages
import LoginPage from "./pages/LoginPage";
import StudentDashboard from "./pages/student/StudentDashboard";
import CodingPracticePage from "./pages/student/CodingPracticePage";
import LearningPathPage from "./pages/student/LearningPathPage";
import FacultyDashboard from "./pages/faculty/FacultyDashboard";
import CollegeAdminDashboard from "./pages/admin/CollegeAdminDashboard";
import SuperAdminDashboard from "./pages/super-admin/SuperAdminDashboard";
import NotFound from "./pages/NotFound";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

const IndexRedirect = () => {
  const { isAuthenticated, user } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  switch (user?.role) {
    case 'student':
      return <Navigate to="/student" replace />;
    case 'faculty':
      return <Navigate to="/faculty" replace />;
    case 'college_admin':
      return <Navigate to="/admin" replace />;
    case 'super_admin':
      return <Navigate to="/super-admin" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<IndexRedirect />} />
          <Route path="/login" element={<LoginPage />} />
          
          {/* Student Routes */}
          <Route path="/student" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />
          <Route path="/student/coding" element={<ProtectedRoute allowedRoles={['student']}><CodingPracticePage /></ProtectedRoute>} />
          <Route path="/student/my-learning-path" element={<ProtectedRoute allowedRoles={['student']}><LearningPathPage /></ProtectedRoute>} />
          
          {/* Faculty Routes */}
          <Route path="/faculty" element={<ProtectedRoute allowedRoles={['faculty']}><FacultyDashboard /></ProtectedRoute>} />
          
          {/* College Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['college_admin']}><CollegeAdminDashboard /></ProtectedRoute>} />
          
          {/* Super Admin Routes */}
          <Route path="/super-admin" element={<ProtectedRoute allowedRoles={['super_admin']}><SuperAdminDashboard /></ProtectedRoute>} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
