import { CheckCircle2, XCircle, Clock, AlertCircle, MemoryStick } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export interface TestResult {
  testCaseId?: string;
  passed: boolean;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  runtime?: number;
  memory?: number;
  error?: string;
}

export interface ExecutionResults {
  status: 'success' | 'error' | 'timeout' | 'memory_exceeded';
  results?: TestResult[];
  error?: string;
  runtime?: number;
  memory?: number;
}

interface CodeExecutionResultsProps {
  results: ExecutionResults | null;
  isRunning?: boolean;
}

export const CodeExecutionResults = ({ results, isRunning }: CodeExecutionResultsProps) => {
  if (isRunning) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <Clock className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Running code...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!results) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <p className="text-sm text-muted-foreground">
            Run your code to see results
          </p>
        </CardContent>
      </Card>
    );
  }

  const getStatusIcon = () => {
    switch (results.status) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-success" />;
      case 'timeout':
        return <Clock className="h-5 w-5 text-warning" />;
      case 'memory_exceeded':
        return <MemoryStick className="h-5 w-5 text-warning" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-destructive" />;
      default:
        return <AlertCircle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusText = () => {
    switch (results.status) {
      case 'success':
        return 'All test cases passed';
      case 'timeout':
        return 'Time Limit Exceeded';
      case 'memory_exceeded':
        return 'Memory Limit Exceeded';
      case 'error':
        return 'Execution Error';
      default:
        return 'Unknown Status';
    }
  };

  const getStatusColor = () => {
    switch (results.status) {
      case 'success':
        return 'text-success';
      case 'timeout':
      case 'memory_exceeded':
        return 'text-warning';
      case 'error':
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  };

  // Show error message if there's a general error
  if (results.error && !results.results) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <CardTitle className={`text-base ${getStatusColor()}`}>
              {getStatusText()}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
            <pre className="text-xs font-mono whitespace-pre-wrap text-destructive">
              {results.error}
            </pre>
          </div>
        </CardContent>
      </Card>
    );
  }

  const passedTests = results.results?.filter(r => r.passed).length || 0;
  const totalTests = results.results?.length || 0;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <CardTitle className={`text-base ${getStatusColor()}`}>
              {getStatusText()}
            </CardTitle>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>
              {passedTests}/{totalTests} passed
            </span>
            {results.runtime !== undefined && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {results.runtime}ms
              </span>
            )}
            {results.memory !== undefined && (
              <span className="flex items-center gap-1">
                <MemoryStick className="h-3 w-3" />
                {results.memory}MB
              </span>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full">
          <div className="p-6 pt-0 space-y-3">
            {results.results?.map((result, index) => (
              <div
                key={index}
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
                  {result.runtime !== undefined && (
                    <Badge variant="outline" className="text-xs">
                      {result.runtime}ms
                    </Badge>
                  )}
                </div>

                <Tabs defaultValue="input" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 h-8">
                    <TabsTrigger value="input" className="text-xs">
                      Input
                    </TabsTrigger>
                    <TabsTrigger value="expected" className="text-xs">
                      Expected
                    </TabsTrigger>
                    <TabsTrigger value="actual" className="text-xs">
                      {result.passed ? 'Output' : 'Actual'}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="input" className="mt-2">
                    <div className="bg-muted/50 rounded p-2">
                      <pre className="text-xs font-mono whitespace-pre-wrap">
                        {result.input || '(empty)'}
                      </pre>
                    </div>
                  </TabsContent>

                  <TabsContent value="expected" className="mt-2">
                    <div className="bg-muted/50 rounded p-2">
                      <pre className="text-xs font-mono whitespace-pre-wrap">
                        {result.expectedOutput || '(empty)'}
                      </pre>
                    </div>
                  </TabsContent>

                  <TabsContent value="actual" className="mt-2">
                    <div
                      className={`rounded p-2 ${
                        result.passed ? 'bg-muted/50' : 'bg-destructive/10'
                      }`}
                    >
                      {result.error ? (
                        <pre className="text-xs font-mono whitespace-pre-wrap text-destructive">
                          {result.error}
                        </pre>
                      ) : (
                        <pre className="text-xs font-mono whitespace-pre-wrap">
                          {result.actualOutput || '(empty)'}
                        </pre>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>

                {!result.passed && !result.error && (
                  <div className="mt-2 pt-2 border-t border-destructive/20">
                    <p className="text-xs font-medium text-destructive mb-1">
                      Difference:
                    </p>
                    <div className="bg-destructive/10 rounded p-2">
                      <div className="text-xs font-mono space-y-1">
                        <div className="text-destructive">
                          - {result.expectedOutput}
                        </div>
                        <div className="text-success">
                          + {result.actualOutput}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
