import {
  Users,
  GraduationCap,
  Trophy,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  BarChart3,
  Building2,
  Calendar,
  Award,
  Target,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard, ProgressBar, SkillScoreRing } from '@/components/dashboard/SkillWidgets';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { collegeAnalytics } from '@/data/mockData';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  RadialBarChart,
  RadialBar,
  Legend,
} from 'recharts';

const CollegeAdminDashboard = () => {
  const {
    totalStudents,
    activeStudents,
    placementReady,
    averageScore,
    batchWiseData,
    skillHeatmap,
    highRiskStudents,
  } = collegeAnalytics;

  const placementReadinessRate = Math.round((placementReady / totalStudents) * 100);

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">College Admin Dashboard</h1>
            <p className="text-muted-foreground">
              IIT Delhi • Placement readiness overview
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline">
              <BarChart3 className="mr-2 h-4 w-4" />
              Export Report
            </Button>
            <Button>
              <Users className="mr-2 h-4 w-4" />
              Manage Students
            </Button>
          </div>
        </div>

        {/* Main Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Students"
            value={totalStudents.toLocaleString()}
            subtitle={`${activeStudents} active this week`}
            icon={<Users className="h-5 w-5" />}
            variant="coding"
          />
          <StatCard
            title="Placement Ready"
            value={`${placementReadinessRate}%`}
            subtitle={`${placementReady} students`}
            icon={<Trophy className="h-5 w-5" />}
            variant="behavior"
            trend="up"
            trendValue="+5% from last month"
          />
          <StatCard
            title="Average Score"
            value={`${averageScore}%`}
            subtitle="Across all skills"
            icon={<Target className="h-5 w-5" />}
            variant="writing"
          />
          <StatCard
            title="High Risk Students"
            value={highRiskStudents.length}
            subtitle="Need immediate attention"
            icon={<AlertTriangle className="h-5 w-5" />}
            variant="default"
          />
        </div>

        {/* Placement Readiness & Skill Heatmap */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Placement Readiness Index */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Placement Readiness Index</CardTitle>
              <CardDescription>Overall college performance</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center py-6">
              <SkillScoreRing
                score={placementReadinessRate}
                size="lg"
                color="primary"
                label="Placement Ready"
              />
              <div className="grid grid-cols-2 gap-4 mt-6 w-full">
                <div className="text-center p-3 rounded-lg bg-success/10">
                  <p className="text-2xl font-bold text-success">{placementReady}</p>
                  <p className="text-xs text-muted-foreground">Ready</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-warning/10">
                  <p className="text-2xl font-bold text-warning">{totalStudents - placementReady}</p>
                  <p className="text-xs text-muted-foreground">In Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Skill Heatmap */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Skill Distribution</CardTitle>
              <CardDescription>Average scores across skill areas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={skillHeatmap} layout="vertical" barSize={32}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-muted" />
                    <XAxis type="number" domain={[0, 100]} className="text-xs" />
                    <YAxis type="category" dataKey="skill" className="text-xs" width={80} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                      {skillHeatmap.map((entry, index) => {
                        const colors = [
                          'hsl(var(--skill-coding))',
                          'hsl(var(--skill-writing))',
                          'hsl(var(--skill-reading))',
                          'hsl(var(--skill-speaking))',
                          'hsl(var(--skill-behavior))',
                        ];
                        return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Batch Analytics & High Risk */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Batch-wise Analytics */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Batch-wise Analytics</CardTitle>
                  <CardDescription>Performance comparison across batches</CardDescription>
                </div>
                <Badge variant="secondary">{batchWiseData.length} batches</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Batch</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Students</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Avg Score</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Placement %</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {batchWiseData.map((batch, index) => (
                      <tr key={batch.batch} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <GraduationCap className="h-4 w-4 text-primary" />
                            <span className="font-medium">Batch {batch.batch}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">{batch.students}</td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={batch.avgScore >= 75 ? 'default' : 'secondary'}
                            className={batch.avgScore >= 75 ? 'bg-success' : ''}
                          >
                            {batch.avgScore}%
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <ProgressBar value={batch.placementRate} size="sm" className="w-24" />
                            <span className="text-sm">{batch.placementRate}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {index < 2 ? (
                            <span className="flex items-center text-success text-sm">
                              <TrendingUp className="h-4 w-4 mr-1" />
                              Up
                            </span>
                          ) : (
                            <span className="flex items-center text-muted-foreground text-sm">
                              →
                              Stable
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* High Risk Students */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <CardTitle className="text-lg">High Risk Students</CardTitle>
              </div>
              <CardDescription>Students needing immediate attention</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {highRiskStudents.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-destructive/5 border border-destructive/20"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-destructive/10 text-destructive text-sm">
                      {student.name.split(' ').pop()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{student.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <ProgressBar
                        value={student.score}
                        size="sm"
                        color="destructive"
                        className="w-16"
                      />
                      <span className="text-xs text-muted-foreground">{student.score}%</span>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      student.riskLevel === 'high'
                        ? 'border-destructive text-destructive'
                        : 'border-warning text-warning'
                    }
                  >
                    {student.riskLevel}
                  </Badge>
                </div>
              ))}
              <Button variant="outline" className="w-full" size="sm">
                View All At-Risk Students
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                <Users className="h-6 w-6 text-primary" />
                <span>Bulk Upload Students</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                <Calendar className="h-6 w-6 text-primary" />
                <span>Schedule Assessment</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                <Award className="h-6 w-6 text-primary" />
                <span>Generate Certificates</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                <BarChart3 className="h-6 w-6 text-primary" />
                <span>Download Reports</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CollegeAdminDashboard;
