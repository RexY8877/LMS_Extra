import {
  Users,
  ClipboardCheck,
  Calendar,
  TrendingUp,
  Clock,
  BarChart3,
  MessageSquare,
  Video,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard, ProgressBar } from '@/components/dashboard/SkillWidgets';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { facultyData } from '@/data/mockData';

const FacultyDashboard = () => {
  const {
    pendingReviews,
    activeBatches,
    totalStudents,
    upcomingSessions,
    recentSubmissions,
    batchProgress,
  } = facultyData;

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Faculty Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your batches and track student progress
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline">
              <Calendar className="mr-2 h-4 w-4" />
              Schedule Session
            </Button>
            <Button>
              <Video className="mr-2 h-4 w-4" />
              Start Live Class
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Pending Reviews"
            value={pendingReviews}
            subtitle="Awaiting your feedback"
            icon={<ClipboardCheck className="h-5 w-5" />}
            variant="behavior"
          />
          <StatCard
            title="Active Batches"
            value={activeBatches}
            subtitle="Currently teaching"
            icon={<Users className="h-5 w-5" />}
            variant="coding"
          />
          <StatCard
            title="Total Students"
            value={totalStudents}
            subtitle="Across all batches"
            icon={<Users className="h-5 w-5" />}
            variant="writing"
          />
          <StatCard
            title="Avg. Batch Progress"
            value="64%"
            subtitle="Course completion"
            icon={<TrendingUp className="h-5 w-5" />}
            trend="up"
            trendValue="+8% this month"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Upcoming Sessions */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Upcoming Sessions</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingSessions.map((session) => (
                <div
                  key={session.id}
                  className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{session.title}</p>
                      <p className="text-sm text-muted-foreground">{session.batch}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {session.time}
                    </Badge>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" className="flex-1">
                      <Video className="mr-1 h-3 w-3" />
                      Start
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <MessageSquare className="mr-1 h-3 w-3" />
                      Notify
                    </Button>
                  </div>
                </div>
              ))}
              <Button variant="ghost" className="w-full" size="sm">
                View Full Schedule
              </Button>
            </CardContent>
          </Card>

          {/* Recent Submissions */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Recent Submissions</CardTitle>
                </div>
                <Badge variant="secondary">{pendingReviews} pending</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentSubmissions.map((submission) => (
                  <div
                    key={submission.id}
                    className="flex items-center gap-4 p-3 rounded-lg bg-muted/50"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">
                        {submission.student.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{submission.student}</p>
                        {submission.status === 'pending' ? (
                          <AlertCircle className="h-4 w-4 text-warning" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4 text-success" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {submission.assignment}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-muted-foreground">{submission.submitted}</p>
                      <Badge
                        variant={submission.status === 'pending' ? 'outline' : 'secondary'}
                        className="mt-1 text-xs"
                      >
                        {submission.status}
                      </Badge>
                    </div>
                    <Button variant="ghost" size="icon" className="shrink-0">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button variant="ghost" className="w-full mt-4" size="sm">
                View All Submissions
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Batch Progress */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Batch Progress Overview</CardTitle>
            </div>
            <CardDescription>Track course completion across your batches</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {batchProgress.map((batch) => (
                <div key={batch.batch} className="p-4 rounded-lg border bg-card">
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-medium">{batch.batch}</p>
                    <Badge variant="secondary" className="text-xs">
                      {batch.students} students
                    </Badge>
                  </div>
                  <ProgressBar
                    value={batch.progress}
                    color={
                      batch.progress >= 70
                        ? 'success'
                        : batch.progress >= 50
                        ? 'warning'
                        : 'destructive'
                    }
                    size="md"
                    showLabel
                  />
                  <div className="mt-3 flex justify-between text-sm">
                    <span className="text-muted-foreground">Course Progress</span>
                    <Button variant="link" size="sm" className="h-auto p-0 text-primary">
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default FacultyDashboard;
