import { useState, useEffect } from 'react';
import { Clock, MemoryStick, CheckCircle2, XCircle, AlertCircle, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';

export interface SubmissionHistoryItem {
  id: string;
  status: 'Accepted' | 'Wrong Answer' | 'Time Limit Exceeded' | 'Memory Limit Exceeded' | 'Runtime Error' | 'Compilation Error';
  runtime?: number;
  memory?: number;
  runtimePercentile?: number;
  memoryPercentile?: number;
  testsPassed: number;
  totalTests: number;
  language: string;
  createdAt: string;
}

interface SubmissionHistoryProps {
  problemId: string | number;
  userId: string | number;
  onSubmissionSelect?: (submissionId: string) => void;
}

export const SubmissionHistory = ({ problemId, userId, onSubmissionSelect }: SubmissionHistoryProps) => {
  const [submissions, setSubmissions] = useState<SubmissionHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);

  // Fetch submission history
  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!userId || !problemId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (statusFilter !== 'all') {
          params.append('status', statusFilter);
        }

        const response = await fetch(
          `/api/submissions/user/${userId}/problem/${problemId}?${params.toString()}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch submission history');
        }

        const data = await response.json();
        setSubmissions(data.submissions || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching submissions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [userId, problemId, statusFilter]);

  const handleSubmissionClick = (submissionId: string) => {
    setSelectedSubmissionId(submissionId);
    onSubmissionSelect?.(submissionId);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Accepted':
        return <CheckCircle2 className="h-4 w-4 text-success" />;
      case 'Time Limit Exceeded':
        return <Clock className="h-4 w-4 text-warning" />;
      case 'Memory Limit Exceeded':
        return <MemoryStick className="h-4 w-4 text-warning" />;
      case 'Wrong Answer':
      case 'Runtime Error':
      case 'Compilation Error':
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadgeVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'Accepted':
        return 'default';
      case 'Wrong Answer':
      case 'Runtime Error':
      case 'Compilation Error':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return timestamp;
    }
  };

  const getLanguageDisplay = (language: string) => {
    const languageMap: Record<string, string> = {
      python: 'Python',
      javascript: 'JavaScript',
      java: 'Java',
    };
    return languageMap[language] || language;
  };

  // Find the best accepted submission
  const bestAcceptedSubmission = submissions.find(s => s.status === 'Accepted');

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-3 shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Submission History</CardTitle>
          <Badge variant="secondary">{submissions.length} total</Badge>
        </div>

        {/* Status Filter */}
        <div className="mt-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-8 text-sm">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Submissions</SelectItem>
              <SelectItem value="Accepted">Accepted</SelectItem>
              <SelectItem value="Wrong Answer">Wrong Answer</SelectItem>
              <SelectItem value="Time Limit Exceeded">Time Limit Exceeded</SelectItem>
              <SelectItem value="Memory Limit Exceeded">Memory Limit Exceeded</SelectItem>
              <SelectItem value="Runtime Error">Runtime Error</SelectItem>
              <SelectItem value="Compilation Error">Compilation Error</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-0">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-sm text-muted-foreground">Loading submissions...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-32 px-4">
            <p className="text-sm text-destructive mb-2">Error: {error}</p>
          </div>
        ) : submissions.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-sm text-muted-foreground">
              {statusFilter === 'all' 
                ? 'No submissions yet' 
                : `No ${statusFilter} submissions`}
            </p>
          </div>
        ) : (
          <ScrollArea className="h-full">
            <div className="divide-y">
              {submissions.map((submission) => {
                const isAccepted = submission.status === 'Accepted';
                const isBest = bestAcceptedSubmission?.id === submission.id;
                const isSelected = selectedSubmissionId === submission.id;

                return (
                  <button
                    key={submission.id}
                    onClick={() => handleSubmissionClick(submission.id)}
                    className={`w-full text-left p-3 hover:bg-muted/50 transition-colors relative ${
                      isSelected ? 'bg-muted' : ''
                    } ${isAccepted ? 'bg-success/5' : ''}`}
                  >
                    {/* Best Solution Badge */}
                    {isBest && (
                      <div className="absolute top-2 right-2">
                        <Badge variant="default" className="text-xs bg-success">
                          Best
                        </Badge>
                      </div>
                    )}

                    <div className="flex items-start gap-3 pr-12">
                      <div className="mt-0.5">
                        {getStatusIcon(submission.status)}
                      </div>

                      <div className="flex-1 min-w-0 space-y-2">
                        {/* Status and Language */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge 
                            variant={getStatusBadgeVariant(submission.status)}
                            className="text-xs"
                          >
                            {submission.status}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {getLanguageDisplay(submission.language)}
                          </Badge>
                        </div>

                        {/* Test Results */}
                        <div className="text-xs text-muted-foreground">
                          {submission.testsPassed}/{submission.totalTests} test cases passed
                        </div>

                        {/* Performance Metrics */}
                        {isAccepted && (
                          <div className="flex items-center gap-3 text-xs">
                            {submission.runtime !== undefined && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3 text-muted-foreground" />
                                <span>{submission.runtime}ms</span>
                                {submission.runtimePercentile !== undefined && (
                                  <span className="text-muted-foreground">
                                    ({submission.runtimePercentile.toFixed(0)}%)
                                  </span>
                                )}
                              </div>
                            )}
                            {submission.memory !== undefined && (
                              <div className="flex items-center gap-1">
                                <MemoryStick className="h-3 w-3 text-muted-foreground" />
                                <span>{submission.memory}MB</span>
                                {submission.memoryPercentile !== undefined && (
                                  <span className="text-muted-foreground">
                                    ({submission.memoryPercentile.toFixed(0)}%)
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Timestamp */}
                        <div className="text-xs text-muted-foreground">
                          {formatTimestamp(submission.createdAt)}
                        </div>
                      </div>

                      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                    </div>
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};
