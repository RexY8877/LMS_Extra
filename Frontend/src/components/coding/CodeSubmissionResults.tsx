import { CheckCircle2, XCircle, Clock, AlertCircle, MemoryStick, Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useEffect, useState } from 'react';

export interface SubmissionResult {
  submissionId: string;
  status: 'Accepted' | 'Wrong Answer' | 'Time Limit Exceeded' | 'Memory Limit Exceeded' | 'Runtime Error' | 'Compilation Error';
  testsPassed: number;
  totalTests: number;
  runtime?: number;
  memory?: number;
  runtimePercentile?: number;
  memoryPercentile?: number;
  error?: string;
  failedTestCase?: {
    input: string;
    expectedOutput: string;
    actualOutput: string;
    error?: string;
  };
}

interface CodeSubmissionResultsProps {
  result: SubmissionResult | null;
  isSubmitting?: boolean;
}

export const CodeSubmissionResults = ({ result, isSubmitting }: CodeSubmissionResultsProps) => {
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    if (result?.status === 'Accepted') {
      setShowAnimation(true);
      const timer = setTimeout(() => setShowAnimation(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [result]);

  if (isSubmitting) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <Clock className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Submitting code...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!result) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <p className="text-sm text-muted-foreground">
            Submit your code to see results
          </p>
        </CardContent>
      </Card>
    );
  }

  const getStatusIcon = () => {
    switch (result.status) {
      case 'Accepted':
        return <CheckCircle2 className="h-6 w-6 text-success" />;
      case 'Time Limit Exceeded':
        return <Clock className="h-6 w-6 text-warning" />;
      case 'Memory Limit Exceeded':
        return <MemoryStick className="h-6 w-6 text-warning" />;
      case 'Wrong Answer':
      case 'Runtime Error':
      case 'Compilation Error':
        return <XCircle className="h-6 w-6 text-destructive" />;
      default:
        return <AlertCircle className="h-6 w-6 text-muted-foreground" />;
    }
  };

  const getStatusColor = () => {
    switch (result.status) {
      case 'Accepted':
        return 'text-success';
      case 'Time Limit Exceeded':
      case 'Memory Limit Exceeded':
        return 'text-warning';
      case 'Wrong Answer':
      case 'Runtime Error':
      case 'Compilation Error':
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStatusBgColor = () => {
    switch (result.status) {
      case 'Accepted':
        return 'bg-success/10 border-success/20';
      case 'Time Limit Exceeded':
      case 'Memory Limit Exceeded':
        return 'bg-warning/10 border-warning/20';
      case 'Wrong Answer':
      case 'Runtime Error':
      case 'Compilation Error':
        return 'bg-destructive/10 border-destructive/20';
      default:
        return 'bg-muted/10 border-muted/20';
    }
  };

  return (
    <Card className="h-full flex flex-col relative overflow-hidden">
      {/* Success Animation */}
      {showAnimation && result.status === 'Accepted' && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/95 animate-in fade-in duration-300">
          <div className="text-center space-y-4">
            <Trophy className="h-24 w-24 text-success mx-auto animate-bounce" />
            <div>
              <h3 className="text-2xl font-bold text-success">Accepted!</h3>
              <p className="text-muted-foreground">Great job solving this problem</p>
            </div>
          </div>
        </div>
      )}

      <CardHeader className="pb-3 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <div>
              <CardTitle className={`text-lg ${getStatusColor()}`}>
                {result.status}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {result.testsPassed}/{result.totalTests} test cases passed
              </p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full">
          <div className="p-6 pt-0 space-y-4">
            {/* Test Progress */}
            <div className={`border rounded-lg p-4 ${getStatusBgColor()}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Test Cases</span>
                <span className="text-sm font-medium">
                  {result.testsPassed}/{result.totalTests}
                </span>
              </div>
              <Progress
                value={(result.testsPassed / result.totalTests) * 100}
                className="h-2"
              />
            </div>

            {/* Performance Metrics */}
            {result.status === 'Accepted' && (
              <div className="grid grid-cols-2 gap-4">
                {/* Runtime Percentile */}
                {result.runtime !== undefined && result.runtimePercentile !== undefined && (
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Runtime</span>
                    </div>
                    <p className="text-2xl font-bold">{result.runtime}ms</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Beats {result.runtimePercentile.toFixed(1)}% of submissions
                    </p>
                    <Progress
                      value={result.runtimePercentile}
                      className="h-1 mt-2"
                    />
                  </div>
                )}

                {/* Memory Percentile */}
                {result.memory !== undefined && result.memoryPercentile !== undefined && (
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <MemoryStick className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Memory</span>
                    </div>
                    <p className="text-2xl font-bold">{result.memory}MB</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Beats {result.memoryPercentile.toFixed(1)}% of submissions
                    </p>
                    <Progress
                      value={result.memoryPercentile}
                      className="h-1 mt-2"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Error Message */}
            {result.error && (
              <div className="border border-destructive/20 rounded-lg p-4 bg-destructive/5">
                <p className="text-sm font-medium text-destructive mb-2">Error</p>
                <pre className="text-xs font-mono whitespace-pre-wrap text-destructive">
                  {result.error}
                </pre>
              </div>
            )}

            {/* Failed Test Case */}
            {result.failedTestCase && (
              <div className="border border-destructive/20 rounded-lg p-4 bg-destructive/5">
                <p className="text-sm font-medium text-destructive mb-3">
                  First Failed Test Case
                </p>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      Input:
                    </p>
                    <div className="bg-muted/50 rounded p-2">
                      <pre className="text-xs font-mono whitespace-pre-wrap">
                        {result.failedTestCase.input}
                      </pre>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      Expected Output:
                    </p>
                    <div className="bg-muted/50 rounded p-2">
                      <pre className="text-xs font-mono whitespace-pre-wrap">
                        {result.failedTestCase.expectedOutput}
                      </pre>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      Your Output:
                    </p>
                    <div className="bg-destructive/10 rounded p-2">
                      {result.failedTestCase.error ? (
                        <pre className="text-xs font-mono whitespace-pre-wrap text-destructive">
                          {result.failedTestCase.error}
                        </pre>
                      ) : (
                        <pre className="text-xs font-mono whitespace-pre-wrap">
                          {result.failedTestCase.actualOutput}
                        </pre>
                      )}
                    </div>
                  </div>

                  {!result.failedTestCase.error && (
                    <div className="pt-2 border-t border-destructive/20">
                      <p className="text-xs font-medium text-destructive mb-2">
                        Difference:
                      </p>
                      <div className="bg-destructive/10 rounded p-2">
                        <div className="text-xs font-mono space-y-1">
                          <div className="text-destructive">
                            - {result.failedTestCase.expectedOutput}
                          </div>
                          <div className="text-success">
                            + {result.failedTestCase.actualOutput}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Success Message */}
            {result.status === 'Accepted' && (
              <div className="border border-success/20 rounded-lg p-4 bg-success/5">
                <div className="flex items-center gap-2 text-success">
                  <CheckCircle2 className="h-5 w-5" />
                  <p className="text-sm font-medium">
                    Congratulations! Your solution passed all test cases.
                  </p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
