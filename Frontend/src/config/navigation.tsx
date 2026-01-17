import { ReactNode } from 'react';
import {
  LayoutDashboard,
  Code2,
  BookOpen,
  Mic,
  FileText,
  Brain,
  BarChart3,
  Award,
  Users,
  Settings,
  GraduationCap,
  Building2,
  ClipboardCheck,
  Calendar,
  Trophy,
  MessageSquare,
  Video,
  FolderKanban,
} from 'lucide-react';
import { UserRole } from '@/stores/authStore';

export interface NavItem {
  title: string;
  href: string;
  icon: ReactNode;
  badge?: string | number;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

const iconClass = "h-5 w-5";

export const studentNavigation: NavGroup[] = [
  {
    title: 'Overview',
    items: [
      { title: 'Dashboard', href: '/student', icon: <LayoutDashboard className={iconClass} /> },
      { title: 'My Learning Path', href: '/student/learning-path', icon: <GraduationCap className={iconClass} /> },
    ],
  },
  {
    title: 'Skills Training',
    items: [
      { title: 'Coding Practice', href: '/student/coding', icon: <Code2 className={iconClass} />, badge: '5' },
      { title: 'Writing Assessment', href: '/student/writing', icon: <FileText className={iconClass} /> },
      { title: 'Reading Assessment', href: '/student/reading', icon: <BookOpen className={iconClass} /> },
      { title: 'Speaking Assessment', href: '/student/speaking', icon: <Mic className={iconClass} /> },
    ],
  },
  {
    title: 'Employability',
    items: [
      { title: 'Behavioral Skills', href: '/student/behavioral', icon: <Brain className={iconClass} /> },
      { title: 'Mock Interviews', href: '/student/interviews', icon: <MessageSquare className={iconClass} /> },
    ],
  },
  {
    title: 'Progress',
    items: [
      { title: 'Reports & Analytics', href: '/student/reports', icon: <BarChart3 className={iconClass} /> },
      { title: 'Certificates', href: '/student/certificates', icon: <Award className={iconClass} /> },
      { title: 'Leaderboard', href: '/student/leaderboard', icon: <Trophy className={iconClass} /> },
    ],
  },
];

export const facultyNavigation: NavGroup[] = [
  {
    title: 'Overview',
    items: [
      { title: 'Dashboard', href: '/faculty', icon: <LayoutDashboard className={iconClass} /> },
      { title: 'My Batches', href: '/faculty/batches', icon: <Users className={iconClass} /> },
    ],
  },
  {
    title: 'Assessments',
    items: [
      { title: 'Pending Reviews', href: '/faculty/reviews', icon: <ClipboardCheck className={iconClass} />, badge: '12' },
      { title: 'Assignments', href: '/faculty/assignments', icon: <FileText className={iconClass} /> },
      { title: 'Live Sessions', href: '/faculty/sessions', icon: <Video className={iconClass} /> },
    ],
  },
  {
    title: 'Content',
    items: [
      { title: 'Course Builder', href: '/faculty/courses', icon: <FolderKanban className={iconClass} /> },
      { title: 'Question Bank', href: '/faculty/questions', icon: <Code2 className={iconClass} /> },
    ],
  },
  {
    title: 'Analytics',
    items: [
      { title: 'Student Progress', href: '/faculty/progress', icon: <BarChart3 className={iconClass} /> },
      { title: 'Reports', href: '/faculty/reports', icon: <FileText className={iconClass} /> },
    ],
  },
];

export const collegeAdminNavigation: NavGroup[] = [
  {
    title: 'Overview',
    items: [
      { title: 'Dashboard', href: '/admin', icon: <LayoutDashboard className={iconClass} /> },
      { title: 'Placement Readiness', href: '/admin/placement', icon: <Trophy className={iconClass} /> },
    ],
  },
  {
    title: 'Management',
    items: [
      { title: 'Students', href: '/admin/students', icon: <Users className={iconClass} /> },
      { title: 'Faculty', href: '/admin/faculty', icon: <GraduationCap className={iconClass} /> },
      { title: 'Batches', href: '/admin/batches', icon: <Building2 className={iconClass} /> },
    ],
  },
  {
    title: 'Analytics',
    items: [
      { title: 'Skill Analytics', href: '/admin/analytics', icon: <BarChart3 className={iconClass} /> },
      { title: 'Attendance', href: '/admin/attendance', icon: <Calendar className={iconClass} /> },
      { title: 'Certifications', href: '/admin/certifications', icon: <Award className={iconClass} /> },
    ],
  },
  {
    title: 'Settings',
    items: [
      { title: 'College Settings', href: '/admin/settings', icon: <Settings className={iconClass} /> },
    ],
  },
];

export const superAdminNavigation: NavGroup[] = [
  {
    title: 'Overview',
    items: [
      { title: 'Dashboard', href: '/super-admin', icon: <LayoutDashboard className={iconClass} /> },
      { title: 'All Colleges', href: '/super-admin/colleges', icon: <Building2 className={iconClass} /> },
    ],
  },
  {
    title: 'Analytics',
    items: [
      { title: 'Platform Analytics', href: '/super-admin/analytics', icon: <BarChart3 className={iconClass} /> },
      { title: 'Comparison', href: '/super-admin/comparison', icon: <Trophy className={iconClass} /> },
    ],
  },
  {
    title: 'Management',
    items: [
      { title: 'User Management', href: '/super-admin/users', icon: <Users className={iconClass} /> },
      { title: 'Content Library', href: '/super-admin/content', icon: <FolderKanban className={iconClass} /> },
    ],
  },
  {
    title: 'System',
    items: [
      { title: 'Configuration', href: '/super-admin/config', icon: <Settings className={iconClass} /> },
    ],
  },
];

export const getNavigationByRole = (role: UserRole): NavGroup[] => {
  switch (role) {
    case 'student':
      return studentNavigation;
    case 'faculty':
      return facultyNavigation;
    case 'college_admin':
      return collegeAdminNavigation;
    case 'super_admin':
      return superAdminNavigation;
    default:
      return studentNavigation;
  }
};
