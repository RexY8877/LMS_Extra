import {
  Code2,
  FileText,
  BookOpen,
  Mic,
  Brain,
  TrendingUp,
  Calendar,
  Lightbulb,
  CheckCircle2,
  Clock,
  ArrowRight,
  Trophy,
  Target,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
  SkillScoreRing,
  StatCard,
  SkillBadge,
  ProgressBar,
} from '@/components/dashboard/SkillWidgets';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { studentDashboardData } from '@/data/mockData';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';

const StudentDashboard = () => {
  const {
    skillReadiness,
    codingProgress,
    softSkillsProgress,
    behavioralScore,
    upcomingAssessments,
    recentActivities,
    aiRecommendations,
    skillBreakdown,
    weeklyProgress,
  } = studentDashboardData;

  const radarData = skillBreakdown.map((item) => ({
    skill: item.skill,
    score: item.score,
    fullMark: 100,
  }));

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Welcome back, Rahul! 👋</h1>
            <p className="text-muted-foreground">
              Track your progress and continue your learning journey
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" asChild>
              <Link to="/student/reports">
                <TrendingUp className="mr-2 h-4 w-4" />
                View Full Report
              </Link>
            </Button>
            <Button asChild>
              <Link to="/student/coding">
                <Code2 className="mr-2 h-4 w-4" />
                Practice Now
              </Link>
            </Button>
          </div>
        </div>

        {/* Main Skill Readiness Score */}
        <Card className="overflow-hidden">
          <div className="flex flex-col md:flex-row">
            <div className="flex items-center justify-center p-6 md:p-8 gradient-primary">
              <SkillScoreRing
                score={skillReadiness}
                size="lg"
                label="Overall Readiness"
                color="primary"
                className="text-primary-foreground [&_span]:text-primary-foreground [&_.text-muted-foreground]:text-primary-foreground/70"
              />
            </div>
            <div className="flex-1 p-6">
              <h2 className="text-lg font-semibold mb-4">Skill Breakdown</h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {skillBreakdown.map((skill) => (
                  <div key={skill.skill} className="text-center">
                    <SkillScoreRing
                      score={skill.score}
                      size="sm"
                      color={skill.skill.toLowerCase() as any}
                      showLabel={false}
                    />
                    <p className="mt-2 text-sm font-medium">{skill.skill}</p>
                    <span
                      className={`text-xs ${
                        skill.trend === 'up'
                          ? 'text-success'
                          : skill.trend === 'down'
                          ? 'text-destructive'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {skill.trend === 'up' && '↑ Improving'}
                      {skill.trend === 'down' && '↓ Needs work'}
                      {skill.trend === 'stable' && '→ Stable'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Coding Progress"
            value={`${codingProgress}%`}
            subtitle="12 problems solved this week"
            icon={<Code2 className="h-5 w-5" />}
            variant="coding"
            trend="up"
            trendValue="+5% from last week"
          />
          <StatCard
            title="Soft Skills"
            value={`${softSkillsProgress}%`}
            subtitle="Writing, Reading, Speaking"
            icon={<FileText className="h-5 w-5" />}
            variant="writing"
            trend="up"
            trendValue="+3% from last week"
          />
          <StatCard
            title="Behavioral Score"
            value={`${behavioralScore}%`}
            subtitle="Interview readiness"
            icon={<Brain className="h-5 w-5" />}
            variant="behavior"
            trend="stable"
            trendValue="No change"
          />
          <StatCard
            title="Leaderboard Rank"
            value="#24"
            subtitle="Top 5% in your batch"
            icon={<Trophy className="h-5 w-5" />}
            trend="up"
            trendValue="+3 positions"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Weekly Activity Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Weekly Activity</CardTitle>
              <CardDescription>Your learning time distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyProgress} barGap={8}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="day" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar
                      dataKey="coding"
                      name="Coding"
                      fill="hsl(var(--skill-coding))"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="softSkills"
                      name="Soft Skills"
                      fill="hsl(var(--skill-writing))"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* AI Recommendations */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-warning" />
                <CardTitle className="text-lg">AI Recommendations</CardTitle>
              </div>
              <CardDescription>Personalized suggestions for you</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {aiRecommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                >
                  <div
                    className={`mt-0.5 h-2 w-2 rounded-full ${
                      rec.priority === 'high'
                        ? 'bg-destructive'
                        : rec.priority === 'medium'
                        ? 'bg-warning'
                        : 'bg-success'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{rec.title}</p>
                    <SkillBadge skill={rec.type as any} className="mt-1">
                      {rec.type.charAt(0).toUpperCase() + rec.type.slice(1)}
                    </SkillBadge>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              ))}
              <Button variant="ghost" className="w-full mt-2" size="sm">
                View All Suggestions
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Section */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Upcoming Assessments */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Upcoming Assessments</CardTitle>
                </div>
                <Badge variant="secondary">{upcomingAssessments.length} pending</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingAssessments.map((assessment) => (
                <div
                  key={assessment.id}
                  className="flex items-center gap-4 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                      assessment.type === 'coding'
                        ? 'bg-skill-coding-muted text-skill-coding'
                        : assessment.type === 'writing'
                        ? 'bg-skill-writing-muted text-skill-writing'
                        : 'bg-skill-speaking-muted text-skill-speaking'
                    }`}
                  >
                    {assessment.type === 'coding' && <Code2 className="h-5 w-5" />}
                    {assessment.type === 'writing' && <FileText className="h-5 w-5" />}
                    {assessment.type === 'speaking' && <Mic className="h-5 w-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{assessment.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {assessment.date} at {assessment.time}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Prepare
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Activities */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Recent Activities</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center gap-4 p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10">
                    <CheckCircle2 className="h-5 w-5 text-success" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium">{activity.action}</span>{' '}
                      <span className="text-muted-foreground">{activity.item}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-lg">{activity.score}%</p>
                    <p className="text-xs text-muted-foreground">Score</p>
                  </div>
                </div>
              ))}
              <Button variant="ghost" className="w-full" size="sm">
                View All Activities
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
            <CardDescription>Jump into your next learning activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {[
                { title: 'Daily Challenge', icon: Target, href: '/student/coding', color: 'coding' },
                { title: 'Writing Practice', icon: FileText, href: '/student/writing', color: 'writing' },
                { title: 'Reading Test', icon: BookOpen, href: '/student/reading', color: 'reading' },
                { title: 'Speaking Session', icon: Mic, href: '/student/speaking', color: 'speaking' },
                { title: 'Mock Interview', icon: Brain, href: '/student/interviews', color: 'behavior' },
              ].map((action) => (
                <Link
                  key={action.title}
                  to={action.href}
                  className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 border-dashed transition-all hover:border-solid hover:shadow-md ${
                    action.color === 'coding'
                      ? 'border-skill-coding/30 hover:border-skill-coding hover:bg-skill-coding-muted'
                      : action.color === 'writing'
                      ? 'border-skill-writing/30 hover:border-skill-writing hover:bg-skill-writing-muted'
                      : action.color === 'reading'
                      ? 'border-skill-reading/30 hover:border-skill-reading hover:bg-skill-reading-muted'
                      : action.color === 'speaking'
                      ? 'border-skill-speaking/30 hover:border-skill-speaking hover:bg-skill-speaking-muted'
                      : 'border-skill-behavior/30 hover:border-skill-behavior hover:bg-skill-behavior-muted'
                  }`}
                >
                  <action.icon
                    className={`h-8 w-8 ${
                      action.color === 'coding'
                        ? 'text-skill-coding'
                        : action.color === 'writing'
                        ? 'text-skill-writing'
                        : action.color === 'reading'
                        ? 'text-skill-reading'
                        : action.color === 'speaking'
                        ? 'text-skill-speaking'
                        : 'text-skill-behavior'
                    }`}
                  />
                  <span className="text-sm font-medium text-center">{action.title}</span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
