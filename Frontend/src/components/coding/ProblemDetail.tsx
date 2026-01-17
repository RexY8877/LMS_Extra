import { useState, useEffect } from 'react';
import { BookOpen, Building2, ChevronDown, ChevronRight, Lightbulb } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { DifficultyBadge } from '@/components/dashboard/SkillWidgets';

export interface ProblemExample {
  input: string;
  output: string;
  explanation?: string;
}

export interface ProblemDetailData {
  id: string | number;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  constraints: string[];
  examples: ProblemExample[];
  hints: string[];
  tags: string[];
  companies: string[];
  acceptance: number;
  timeLimit?: number;
  memoryLimit?: number;
}

interface ProblemDetailProps {
  problemId: string | number;
}

export const ProblemDetail = ({ problemId }: ProblemDetailProps) => {
  const [problem, setProblem] = useState<ProblemDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedHints, setExpandedHints] = useState<Set<number>>(new Set());

  useEffect(() => {
    const fetchProblemDetails = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/problems/${problemId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch problem details');
        }
        
        const data = await response.json();
        const problemData = data.problem || data;
        // Only set problem if it has an id (valid problem data)
        setProblem(problemData?.id ? problemData : null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching problem details:', err);
      } finally {
        setLoading(false);
      }
    };

    if (problemId) {
      fetchProblemDetails();
    }
  }, [problemId]);

  const toggleHint = (index: number) => {
    setExpandedHints(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  if (loading) {
    return (
      <Card className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Loading problem details...</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-destructive mb-2">Error: {error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  if (!problem) {
    return (
      <Card className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">No problem selected</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-full overflow-auto">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{problem.title}</CardTitle>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <DifficultyBadge difficulty={problem.difficulty} />
              <span className="text-xs text-muted-foreground">
                Acceptance: {problem.acceptance}%
              </span>
              {problem.timeLimit && (
                <span className="text-xs text-muted-foreground">
                  Time: {problem.timeLimit}ms
                </span>
              )}
              {problem.memoryLimit && (
                <span className="text-xs text-muted-foreground">
                  Memory: {problem.memoryLimit}MB
                </span>
              )}
            </div>
          </div>
          <Button variant="ghost" size="icon">
            <BookOpen className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6 text-sm">
        {/* Description */}
        <div>
          <div 
            className="text-muted-foreground leading-relaxed prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: problem.description }}
          />
        </div>

        {/* Examples */}
        {problem.examples && problem.examples.length > 0 && (
          <div className="space-y-3">
            {problem.examples.map((example, index) => (
              <div key={index} className="space-y-2">
                <p className="font-medium">Example {index + 1}:</p>
                <div className="bg-muted/50 rounded-lg p-3 font-mono text-xs space-y-1">
                  <p>
                    <span className="text-muted-foreground">Input:</span> {example.input}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Output:</span> {example.output}
                  </p>
                  {example.explanation && (
                    <p className="text-muted-foreground mt-2">
                      <span className="font-semibold">Explanation:</span> {example.explanation}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Constraints */}
        {problem.constraints && problem.constraints.length > 0 && (
          <div className="space-y-2">
            <p className="font-medium">Constraints:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              {problem.constraints.map((constraint, index) => (
                <li key={index}>{constraint}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Hints */}
        {problem.hints && problem.hints.length > 0 && (
          <div className="space-y-2">
            <p className="font-medium flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Hints
            </p>
            <div className="space-y-2">
              {problem.hints.map((hint, index) => (
                <Collapsible
                  key={index}
                  open={expandedHints.has(index)}
                  onOpenChange={() => toggleHint(index)}
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-between text-left font-normal"
                    >
                      <span>Hint {index + 1}</span>
                      {expandedHints.has(index) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2">
                    <div className="bg-muted/50 rounded-lg p-3 text-muted-foreground">
                      {hint}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {problem.tags && problem.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {problem.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Companies */}
        {problem.companies && problem.companies.length > 0 && (
          <div className="flex items-start gap-2 pt-2">
            <Building2 className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="flex flex-wrap gap-1">
              {problem.companies.map((company) => (
                <Badge key={company} variant="outline" className="text-xs">
                  {company}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
