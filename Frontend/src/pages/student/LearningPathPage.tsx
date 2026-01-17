import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

interface LearningPathItem {
  type: string;
  title: string;
  priority?: string;
  date?: string;
  time?: string;
}

interface LearningPathData {
  recommendations: LearningPathItem[];
  assessments: LearningPathItem[];
}

const LearningPathPage = () => {
  const { user } = useAuthStore();
  const [data, setData] = useState<LearningPathData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/student/learning-path', {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        });
        if (response.ok) {
          const result = await response.json();
          setData(result);
        }
      } catch (error) {
        console.error('Failed to fetch learning path:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">Loading...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight">My Learning Path</h1>
          <p className="text-muted-foreground">
            Personalized recommendations and upcoming assessments to guide your journey.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* AI Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                AI Recommendations
              </CardTitle>
              <CardDescription>Based on your recent performance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {data?.recommendations.map((item, index) => (
                <div key={index} className="flex items-start justify-between p-4 rounded-lg border bg-card/50">
                  <div className="space-y-1">
                    <h3 className="font-medium leading-none">{item.title}</h3>
                    <p className="text-sm text-muted-foreground capitalize">{item.type} Module</p>
                  </div>
                  {item.priority && (
                    <Badge variant={item.priority === 'high' ? 'destructive' : 'secondary'}>
                      {item.priority} priority
                    </Badge>
                  )}
                </div>
              ))}
              {(!data?.recommendations || data.recommendations.length === 0) && (
                <p className="text-sm text-muted-foreground">No recommendations available yet.</p>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Assessments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                Upcoming Assessments
              </CardTitle>
              <CardDescription>Scheduled tests and submissions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {data?.assessments.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-lg border bg-card/50">
                  <div className="space-y-1">
                    <h3 className="font-medium leading-none">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {item.date} at {item.time}
                    </p>
                  </div>
                  <Button size="sm" variant="outline">
                    Start <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              ))}
              {(!data?.assessments || data.assessments.length === 0) && (
                <p className="text-sm text-muted-foreground">No upcoming assessments.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LearningPathPage;
