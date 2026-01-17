import { useState, useEffect } from 'react';
import { Clock, MemoryStick, CheckCircle2, XCircle, AlertCircle, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import Editor from '@monaco-editor/react';

export interface SubmissionDetailData {
  id: string;
  userId: string;
  problemId: string;
  code: string;
  language: string;
  status: 'Accepted' | 'Wrong Answer' | 'Time Limit Exceeded' | 'Memory Limit Exceeded' | 'Runtime Error' | 'Compilation Error';
  runtime?: number;
  memory?: number;
  runtimePercentile?: number;
  memoryPercentile?: number;
  testsPassed: number;
  totalTests: number;
  testResults?: Array<{
    testCaseId: string;
    passed: boolean;
    input: string;
    expectedOutput: string;
    actualOutput: string;
    runtime?: number;
    memory?: number;
    error?: string;
  }>;
  createdAt: string;
}

interface SubmissionDetailProps {
  submissionId: string | null;
  open: boolean;
  onClose: () => void;
}

export const SubmissionDetail = ({ submissionId, open, onClose }: SubmissionDetailProps) => {
  const [submission, setSubmission] = useState<SubmissionDetailData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch submission details when submissionId changes
  useEffect(() => {
    const fetchSubmission = async () => {
      if (!submissionId) {
        setSubmission(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/submissions/${submissionId}`);

        if (!response.ok) {
          throw new Error('Failed to fetch submission details');
        }

        const data = await response.json();
        setSubmission(data.submission);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching submission:', err);
      } finally {
        setLoading(false);
      }
    };

    if (open && submissionId) {
      fetchSubmission();
    }
  }, [submissionId, open]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Accepted':
        return <CheckCircle2 className="h-5 w-5 text-success" />;
      case 'Time Limit Exceeded':
        return <Clock className="h-5 w-5 text-warning" />;
      case 'Memory Limit Exceeded':
        return <MemoryStick className="h-5 w-5 text-warning" />;
      case 'Wrong Answer':
      case 'Runtime Error':
      case 'Compilation Error':
        return <XCircle className="h-5 w-5 text-destructive" />;
      default:
        return <AlertCircle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
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

  const getMonacoLanguage = (lang: string): string => {
    switch (lang) {
      case 'python':
        return 'python';
      case 'javascript':
        return 'javascript';
      case 'java':
        return 'java';
      default:
        return 'python';
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

  const formatTimestamp = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleString();
    } catch {
      return timestamp;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle>Submission Details</DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-6 w-6">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6 pb-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-sm text-muted-foreground">Loading submission...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-64">
              <p className="text-sm text-destructive mb-2">Error: {error}</p>
              <Button variant="outline" size="sm" onClick={onClose}>
                Close
              </Button>
            </div>
          ) : !submission ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-sm text-muted-foreground">No submission selected</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Status Header */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(submission.status)}
                      <div>
                        <CardTitle className={`text-lg ${getStatusColor(submission.status)}`}>
                          {submission.status}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {submission.testsPassed}/{submission.totalTests} test cases passed
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">{getLanguageDisplay(submission.language)}</Badge>
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatTimestamp(submission.createdAt)}
                      </p>
                    </div>
                  </div>
                </CardHeader>

                {/* Execution Metrics */}
                {submission.status === 'Accepted' && (
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-2 gap-4">
                      {submission.runtime !== undefined && (
                        <div className="border rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Runtime</span>
                          </div>
                          <p className="text-xl font-bold">{submission.runtime}ms</p>
                          {submission.runtimePercentile !== undefined && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Beats {submission.runtimePercentile.toFixed(1)}% of submissions
                            </p>
                          )}
                        </div>
                      )}

                      {submission.memory !== undefined && (
                        <div className="border rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <MemoryStick className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Memory</span>
                          </div>
                          <p className="text-xl font-bold">{submission.memory}MB</p>
                          {submission.memoryPercentile !== undefined && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Beats {submission.memoryPercentile.toFixed(1)}% of submissions
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>

              {/* Code and Test Results Tabs */}
              <Tabs defaultValue="code" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="code">Submitted Code</TabsTrigger>
                  <TabsTrigger value="results">Test Results</TabsTrigger>
                </TabsList>

                <TabsContent value="code" className="mt-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Code</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div style={{ height: '400px' }}>
                        <Editor
                          height="100%"
                          language={getMonacoLanguage(submission.language)}
                          value={submission.code}
                          theme="vs-dark"
                          options={{
                            readOnly: true,
                            minimap: { enabled: false },
                            fontSize: 14,
                            lineNumbers: 'on',
                            scrollBeyondLastLine: false,
                            automaticLayout: true,
                            wordWrap: 'on',
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="results" className="mt-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Test Results</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {!submission.testResults || submission.testResults.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No test results available</p>
                      ) : (
                        <div className="space-y-3">
                          {submission.testResults.map((result, index) => (
                            <div
                              key={result.testCaseId || index}
                              className={`border rounded-lg p-3 ${
                                result.passed
                                  ? 'border-success/20 bg-success/5'
                                  : 'border-destructive/20 bg-destructive/5'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  {result.passed ? (
                                    <CheckCircle2 className="h-4 w-4 text-success" />
                                  ) : (
                                    <XCircle className="h-4 w-4 text-destructive" />
                                  )}
                                  <span className="text-sm font-medium">
                                    Test Case {index + 1}
                                  </span>
                                </div>
                                {result.passed && result.runtime !== undefined && (
                                  <span className="text-xs text-muted-foreground">
                                    {result.runtime}ms
                                  </span>
                                )}
                              </div>

                              <div className="space-y-2 text-xs">
                                <div>
                                  <p className="font-medium text-muted-foreground mb-1">Input:</p>
                                  <div className="bg-muted/50 rounded p-2">
                                    <pre className="font-mono whitespace-pre-wrap">
                                      {result.input}
                                    </pre>
                                  </div>
                                </div>

                                {!result.passed && (
                                  <>
                                    <div>
                                      <p className="font-medium text-muted-foreground mb-1">
                                        Expected Output:
                                      </p>
                                      <div className="bg-muted/50 rounded p-2">
                                        <pre className="font-mono whitespace-pre-wrap">
                                          {result.expectedOutput}
                                        </pre>
                                      </div>
                                    </div>

                                    <div>
                                      <p className="font-medium text-muted-foreground mb-1">
                                        Your Output:
                                      </p>
                                      <div className="bg-destructive/10 rounded p-2">
                                        {result.error ? (
                                          <pre className="font-mono whitespace-pre-wrap text-destructive">
                                            {result.error}
                                          </pre>
                                        ) : (
                                          <pre className="font-mono whitespace-pre-wrap">
                                            {result.actualOutput}
                                          </pre>
                                        )}
                                      </div>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
