import { useState } from 'react';
import { Code2, Trophy, Flame, ChevronDown, ChevronUp } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { ProblemBrowser } from '@/components/coding/ProblemBrowser';
import { ProblemDetail } from '@/components/coding/ProblemDetail';
import { CodeEditor } from '@/components/coding/CodeEditor';
import { SubmissionHistory } from '@/components/coding/SubmissionHistory';
import { useAuthStore } from '@/stores/authStore';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

const CodingPracticePage = () => {
  const { user } = useAuthStore();
  const [selectedProblemId, setSelectedProblemId] = useState<string | number | null>(null);
  const [showSubmissionHistory, setShowSubmissionHistory] = useState(false);

  const handleProblemSelect = (problemId: string | number) => {
    setSelectedProblemId(problemId);
  };

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-8rem)] flex flex-col gap-4 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-skill-coding-muted">
              <Code2 className="h-6 w-6 text-skill-coding" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Coding Practice</h1>
              <p className="text-sm text-muted-foreground">
                Solve problems • Build skills • Get hired
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-warning/10 text-warning">
              <Flame className="h-4 w-4" />
              <span className="text-sm font-medium">5 day streak</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-skill-coding-muted">
              <Trophy className="h-4 w-4 text-skill-coding" />
              <span className="text-sm font-medium text-skill-coding">245 pts</span>
            </div>
          </div>
        </div>

        {/* Main Content - Split View */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0">
          {/* Left Sidebar - Problem Browser */}
          <div className="lg:col-span-3 min-h-0">
            <ProblemBrowser
              onProblemSelect={handleProblemSelect}
              selectedProblemId={selectedProblemId}
            />
          </div>

          {/* Right Content - Problem Detail and Code Editor */}
          <div className="lg:col-span-9 flex flex-col gap-4 min-h-0">
            {/* Problem Detail and Code Editor in Split View */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 flex-1 min-h-0">
              {/* Problem Detail */}
              <div className="min-h-0 overflow-hidden">
                {selectedProblemId ? (
                  <ProblemDetail problemId={selectedProblemId} />
                ) : (
                  <div className="h-full flex items-center justify-center border-2 border-dashed rounded-lg">
                    <div className="text-center text-muted-foreground p-8">
                      <Code2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium mb-2">Select a Problem</p>
                      <p className="text-sm">
                        Choose a problem from the list to start coding
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Code Editor */}
              <div className="min-h-0 overflow-hidden">
                {selectedProblemId ? (
                  <CodeEditor
                    problemId={selectedProblemId}
                    userId={user?.id}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center border-2 border-dashed rounded-lg">
                    <div className="text-center text-muted-foreground p-8">
                      <p className="text-sm">
                        Code editor will appear here
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Collapsible Submission History Panel */}
            {selectedProblemId && user?.id && (
              <Collapsible
                open={showSubmissionHistory}
                onOpenChange={setShowSubmissionHistory}
                className="shrink-0"
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between"
                    size="sm"
                  >
                    <span>Submission History</span>
                    {showSubmissionHistory ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2">
                  <div style={{ height: '300px' }}>
                    <SubmissionHistory
                      problemId={selectedProblemId}
                      userId={user.id}
                    />
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CodingPracticePage;
