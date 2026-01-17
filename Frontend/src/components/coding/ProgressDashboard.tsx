import { useEffect, useState } from 'react';
import { Trophy, TrendingUp, Calendar, Target, Flame, Code2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ProgressBar, DifficultyBadge } from '@/components/dashboard/SkillWidgets';
import { Badge } from '@/components/ui/badge';

interface UserStats {
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  totalSubmissions: number;
  acceptedSubmissions: number;
  acceptanceRate: number;
  solvedByTopic: Record<string, number>;
  dailyActivity: Record<string, number>;
  streak: number;
  lastSolvedAt: string | null;
}

interface ProgressDashboardProps {
  userId: string;
}

export const ProgressDashboard = ({ userId }: ProgressDashboardProps) => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/submissions/user/${userId}/stats`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch user statistics');
        }

        const data = await response.json();
        setStats(data.stats);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchStats();
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-muted rounded-xl" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="h-64 bg-muted rounded-xl" />
          <div className="h-64 bg-muted rounded-xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center text-muted-foreground">
            <p className="text-sm">Failed to load statistics</p>
            <p className="text-xs mt-1">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return null;
  }

  // Generate calendar heatmap data for the last 12 weeks
  const generateHeatmapData = () => {
    const weeks: Array<Array<{ date: string; count: number }>> = [];
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 83); // 12 weeks = 84 days

    for (let week = 0; week < 12; week++) {
      const weekData: Array<{ date: string; count: number }> = [];
      for (let day = 0; day < 7; day++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + week * 7 + day);
        
        if (currentDate <= today) {
          const dateStr = currentDate.toISOString().split('T')[0];
          const count = stats.dailyActivity[dateStr] || 0;
          weekData.push({ date: dateStr, count });
        }
      }
      if (weekData.length > 0) {
        weeks.push(weekData);
      }
    }
    return weeks;
  };

  const heatmapData = generateHeatmapData();

  // Get intensity color based on count
  const getIntensityColor = (count: number) => {
    if (count === 0) return 'bg-muted';
    if (count === 1) return 'bg-skill-coding/20';
    if (count === 2) return 'bg-skill-coding/40';
    if (count === 3) return 'bg-skill-coding/60';
    if (count === 4) return 'bg-skill-coding/80';
    return 'bg-skill-coding';
  };

  // Sort topics by count
  const topicEntries = Object.entries(stats.solvedByTopic).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Solved */}
        <Card className="bg-skill-coding-muted border-skill-coding/20">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Total Solved</p>
                <p className="text-3xl font-bold">{stats.totalSolved}</p>
                <p className="text-xs text-muted-foreground">
                  {stats.totalSubmissions} submissions
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-skill-coding/10">
                <Code2 className="h-5 w-5 text-skill-coding" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Acceptance Rate */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Acceptance Rate</p>
                <p className="text-3xl font-bold">{stats.acceptanceRate.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">
                  {stats.acceptedSubmissions} accepted
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                <Target className="h-5 w-5 text-success" />
              </div>
            </div>
            <div className="mt-3">
              <ProgressBar 
                value={stats.acceptanceRate} 
                max={100} 
                color="success" 
                size="sm"
              />
            </div>
          </CardContent>
        </Card>

        {/* Current Streak */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Current Streak</p>
                <p className="text-3xl font-bold">{stats.streak}</p>
                <p className="text-xs text-muted-foreground">
                  {stats.streak === 1 ? 'day' : 'days'}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                <Flame className="h-5 w-5 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Best Performance */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Performance</p>
                <p className="text-3xl font-bold">
                  {stats.totalSolved > 0 ? 'Active' : 'Start'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {stats.lastSolvedAt 
                    ? `Last: ${new Date(stats.lastSolvedAt).toLocaleDateString()}`
                    : 'No activity yet'}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Trophy className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Difficulty Breakdown and Topics */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Difficulty Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Problems by Difficulty
            </CardTitle>
            <CardDescription>Your progress across difficulty levels</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Easy */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DifficultyBadge difficulty="Easy" />
                  <span className="text-sm text-muted-foreground">Easy</span>
                </div>
                <span className="text-sm font-medium">{stats.easySolved}</span>
              </div>
              <ProgressBar 
                value={stats.easySolved} 
                max={Math.max(stats.easySolved, 50)} 
                color="success" 
                size="sm"
              />
            </div>

            {/* Medium */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DifficultyBadge difficulty="Medium" />
                  <span className="text-sm text-muted-foreground">Medium</span>
                </div>
                <span className="text-sm font-medium">{stats.mediumSolved}</span>
              </div>
              <ProgressBar 
                value={stats.mediumSolved} 
                max={Math.max(stats.mediumSolved, 50)} 
                color="warning" 
                size="sm"
              />
            </div>

            {/* Hard */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DifficultyBadge difficulty="Hard" />
                  <span className="text-sm text-muted-foreground">Hard</span>
                </div>
                <span className="text-sm font-medium">{stats.hardSolved}</span>
              </div>
              <ProgressBar 
                value={stats.hardSolved} 
                max={Math.max(stats.hardSolved, 50)} 
                color="destructive" 
                size="sm"
              />
            </div>

            {/* Summary */}
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Total Problems</span>
                <span className="text-2xl font-bold">{stats.totalSolved}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Topic-based Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5" />
              Skills by Topic
            </CardTitle>
            <CardDescription>Problems solved by category</CardDescription>
          </CardHeader>
          <CardContent>
            {topicEntries.length > 0 ? (
              <div className="space-y-3">
                {topicEntries.slice(0, 8).map(([topic, count]) => (
                  <div key={topic} className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs">
                      {topic}
                    </Badge>
                    <div className="flex items-center gap-2">
                      <div className="w-24">
                        <ProgressBar 
                          value={count} 
                          max={Math.max(...topicEntries.map(([, c]) => c))} 
                          color="coding" 
                          size="sm"
                        />
                      </div>
                      <span className="text-sm font-medium w-8 text-right">{count}</span>
                    </div>
                  </div>
                ))}
                {topicEntries.length > 8 && (
                  <p className="text-xs text-muted-foreground text-center pt-2">
                    +{topicEntries.length - 8} more topics
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">No topics solved yet</p>
                <p className="text-xs mt-1">Start solving problems to see your progress</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Activity Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Daily Activity
          </CardTitle>
          <CardDescription>
            Your coding activity over the last 12 weeks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="inline-flex gap-1">
              {heatmapData.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1">
                  {week.map((day, dayIndex) => (
                    <div
                      key={`${weekIndex}-${dayIndex}`}
                      className={`w-3 h-3 rounded-sm ${getIntensityColor(day.count)} transition-colors hover:ring-2 hover:ring-skill-coding cursor-pointer`}
                      title={`${day.date}: ${day.count} problem${day.count !== 1 ? 's' : ''}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
            <span>Less</span>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm bg-muted" />
              <div className="w-3 h-3 rounded-sm bg-skill-coding/20" />
              <div className="w-3 h-3 rounded-sm bg-skill-coding/40" />
              <div className="w-3 h-3 rounded-sm bg-skill-coding/60" />
              <div className="w-3 h-3 rounded-sm bg-skill-coding/80" />
              <div className="w-3 h-3 rounded-sm bg-skill-coding" />
            </div>
            <span>More</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
