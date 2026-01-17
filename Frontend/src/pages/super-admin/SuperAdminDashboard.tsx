import {
  Building2,
  Users,
  GraduationCap,
  TrendingUp,
  BarChart3,
  Globe,
  Settings,
  Award,
  Activity,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard, ProgressBar } from '@/components/dashboard/SkillWidgets';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { superAdminData } from '@/data/mockData';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

const SuperAdminDashboard = () => {
  const {
    totalColleges,
    totalStudents,
    totalFaculty,
    platformUsage,
    collegeComparison,
    growthMetrics,
  } = superAdminData;

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Super Admin Dashboard</h1>
            <p className="text-muted-foreground">
              My Corporate School • Platform Overview
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline">
              <BarChart3 className="mr-2 h-4 w-4" />
              Analytics
            </Button>
            <Button>
              <Settings className="mr-2 h-4 w-4" />
              Configuration
            </Button>
          </div>
        </div>

        {/* Platform Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Partner Colleges"
            value={totalColleges}
            subtitle="Across 15 states"
            icon={<Building2 className="h-5 w-5" />}
            variant="coding"
            trend="up"
            trendValue="+8 this month"
          />
          <StatCard
            title="Total Students"
            value={totalStudents.toLocaleString()}
            subtitle={`${platformUsage.dailyActive.toLocaleString()} active today`}
            icon={<Users className="h-5 w-5" />}
            variant="writing"
            trend="up"
            trendValue="+2.4k this month"
          />
          <StatCard
            title="Faculty Members"
            value={totalFaculty.toLocaleString()}
            subtitle="Training students"
            icon={<GraduationCap className="h-5 w-5" />}
            variant="reading"
          />
          <StatCard
            title="Monthly Active"
            value={`${(platformUsage.monthlyActive / 1000).toFixed(1)}k`}
            subtitle="Platform engagement"
            icon={<Activity className="h-5 w-5" />}
            variant="speaking"
            trend="up"
            trendValue="+12% MoM"
          />
        </div>

        {/* Growth & Usage */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* User Growth Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Platform Growth</CardTitle>
              <CardDescription>User registrations over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={growthMetrics}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="users"
                      name="Users"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="colleges"
                      name="Colleges"
                      stroke="hsl(var(--skill-coding))"
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--skill-coding))' }}
                      yAxisId="right"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Usage Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Platform Usage</CardTitle>
              <CardDescription>Active users breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 rounded-lg bg-primary/10">
                    <p className="text-3xl font-bold text-primary">
                      {(platformUsage.dailyActive / 1000).toFixed(1)}k
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">Daily Active</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-skill-coding/10">
                    <p className="text-3xl font-bold text-skill-coding">
                      {(platformUsage.weeklyActive / 1000).toFixed(1)}k
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">Weekly Active</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-skill-writing/10">
                    <p className="text-3xl font-bold text-skill-writing">
                      {(platformUsage.monthlyActive / 1000).toFixed(1)}k
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">Monthly Active</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Daily / Weekly Ratio</span>
                      <span className="font-medium">
                        {((platformUsage.dailyActive / platformUsage.weeklyActive) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <ProgressBar
                      value={(platformUsage.dailyActive / platformUsage.weeklyActive) * 100}
                      color="primary"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Weekly / Monthly Ratio</span>
                      <span className="font-medium">
                        {((platformUsage.weeklyActive / platformUsage.monthlyActive) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <ProgressBar
                      value={(platformUsage.weeklyActive / platformUsage.monthlyActive) * 100}
                      color="coding"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* College Comparison */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">College Performance Comparison</CardTitle>
                <CardDescription>Top performing institutions</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                View All Colleges
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      College
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Students
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Avg Score
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Placement Rate
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Rank
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {collegeComparison.map((college, index) => (
                    <tr key={college.name} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                            <Building2 className="h-5 w-5 text-primary" />
                          </div>
                          <span className="font-medium">{college.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-muted-foreground">
                        {college.students.toLocaleString()}
                      </td>
                      <td className="py-4 px-4">
                        <Badge
                          variant={college.avgScore >= 80 ? 'default' : 'secondary'}
                          className={college.avgScore >= 80 ? 'bg-success' : ''}
                        >
                          {college.avgScore}%
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <ProgressBar
                            value={college.placementRate}
                            size="sm"
                            color={college.placementRate >= 90 ? 'success' : 'primary'}
                            className="w-24"
                          />
                          <span className="text-sm font-medium">{college.placementRate}%</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          {index < 3 ? (
                            <Award
                              className={`h-5 w-5 ${
                                index === 0
                                  ? 'text-yellow-500'
                                  : index === 1
                                  ? 'text-gray-400'
                                  : 'text-amber-600'
                              }`}
                            />
                          ) : null}
                          <span className="font-medium">#{index + 1}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">System Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                <Building2 className="h-6 w-6 text-primary" />
                <span>Add New College</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                <Globe className="h-6 w-6 text-primary" />
                <span>Content Library</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                <BarChart3 className="h-6 w-6 text-primary" />
                <span>Generate Reports</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                <Settings className="h-6 w-6 text-primary" />
                <span>System Config</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default SuperAdminDashboard;
