import { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Send, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CodeExecutionResults, ExecutionResults } from './CodeExecutionResults';
import { CodeSubmissionResults, SubmissionResult } from './CodeSubmissionResults';

export type Language = 'python' | 'javascript' | 'java';

interface CodeEditorProps {
  problemId: string | number;
  userId?: string | number;
  onRun?: (code: string, language: Language) => void;
  onSubmit?: (code: string, language: Language) => void;
  isRunning?: boolean;
  isSubmitting?: boolean;
  executionResults?: ExecutionResults | null;
  submissionResult?: SubmissionResult | null;
}

export const CodeEditor = ({
  problemId,
  userId,
  onRun,
  onSubmit,
  isRunning = false,
  isSubmitting = false,
  executionResults = null,
  submissionResult = null,
}: CodeEditorProps) => {
  const [language, setLanguage] = useState<Language>('python');
  const [code, setCode] = useState<string>('');
  const [loadingTemplate, setLoadingTemplate] = useState(false);
  const [internalResults, setInternalResults] = useState<ExecutionResults | null>(null);
  const [internalSubmission, setInternalSubmission] = useState<SubmissionResult | null>(null);
  const [activeTab, setActiveTab] = useState<'run' | 'submit'>('run');
  
  // Store code for each language separately
  const codeCache = useRef<Record<Language, string>>({
    python: '',
    javascript: '',
    java: '',
  });

  // Use external results if provided, otherwise use internal
  const displayResults = executionResults !== undefined ? executionResults : internalResults;
  const displaySubmission = submissionResult !== undefined ? submissionResult : internalSubmission;

  // Fetch solution template when problem or language changes
  useEffect(() => {
    const fetchTemplate = async () => {
      if (!problemId) return;
      
      setLoadingTemplate(true);
      
      try {
        const response = await fetch(
          `/api/problems/${problemId}/template?language=${language}`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch template');
        }
        
        const data = await response.json();
        const template = data.template || '';
        
        // Only set template if we don't have cached code for this language
        if (!codeCache.current[language]) {
          setCode(template);
          codeCache.current[language] = template;
        } else {
          // Restore cached code
          setCode(codeCache.current[language]);
        }
      } catch (err) {
        console.error('Error fetching template:', err);
        // Set empty code on error
        if (!codeCache.current[language]) {
          setCode('');
        }
      } finally {
        setLoadingTemplate(false);
      }
    };

    fetchTemplate();
  }, [problemId, language]);

  const handleLanguageChange = (newLanguage: Language) => {
    // Save current code to cache before switching
    codeCache.current[language] = code;
    
    // Switch language
    setLanguage(newLanguage);
  };

  const handleCodeChange = (value: string | undefined) => {
    const newCode = value || '';
    setCode(newCode);
    codeCache.current[language] = newCode;
  };

  const handleRun = async () => {
    if (isRunning || isSubmitting) return;
    
    if (onRun) {
      onRun(code, language);
    } else {
      // Internal execution logic
      try {
        setInternalResults(null);
        const response = await fetch('/api/execute/run', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            problemId,
            code,
            language,
          }),
        });

        if (!response.ok) {
          throw new Error('Execution failed');
        }

        const data = await response.json();
        setInternalResults(data);
      } catch (err) {
        setInternalResults({
          status: 'error',
          error: err instanceof Error ? err.message : 'An error occurred',
        });
      }
    }
  };

  const handleSubmit = async () => {
    if (isRunning || isSubmitting) return;
    
    if (onSubmit) {
      onSubmit(code, language);
    } else {
      // Internal submission logic
      try {
        setInternalSubmission(null);
        setActiveTab('submit');
        
        const response = await fetch('/api/execute/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            problemId,
            userId,
            code,
            language,
          }),
        });

        if (!response.ok) {
          throw new Error('Submission failed');
        }

        const data = await response.json();
        setInternalSubmission(data);
      } catch (err) {
        setInternalSubmission({
          submissionId: '',
          status: 'Runtime Error',
          testsPassed: 0,
          totalTests: 0,
          error: err instanceof Error ? err.message : 'An error occurred',
        });
      }
    }
  };

  const getMonacoLanguage = (lang: Language): string => {
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

  return (
    <div className="flex flex-col h-full gap-2">
      <Card className="flex flex-col shrink-0">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2">
            <Select value={language} onValueChange={handleLanguageChange as any}>
              <SelectTrigger className="w-40 h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="python">Python</SelectItem>
                <SelectItem value="javascript">JavaScript</SelectItem>
                <SelectItem value="java">Java</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleRun}
                disabled={isRunning || isSubmitting || loadingTemplate}
                className="h-8"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-1" />
                    Run Code
                  </>
                )}
              </Button>
              
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={isRunning || isSubmitting || loadingTemplate}
                className="h-8"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-1" />
                    Submit
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0 overflow-hidden" style={{ height: '400px' }}>
          {loadingTemplate ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Editor
              height="100%"
              language={getMonacoLanguage(language)}
              value={code}
              onChange={handleCodeChange}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: language === 'python' ? 4 : 2,
                insertSpaces: true,
                wordWrap: 'on',
                autoIndent: 'full',
                formatOnPaste: true,
                formatOnType: true,
                bracketPairColorization: { enabled: true },
                matchBrackets: 'always',
              }}
            />
          )}
        </CardContent>
      </Card>

      <div className="flex-1 min-h-0">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-2 shrink-0">
            <TabsTrigger value="run">Test Results</TabsTrigger>
            <TabsTrigger value="submit">Submission</TabsTrigger>
          </TabsList>
          
          <TabsContent value="run" className="flex-1 mt-2 min-h-0">
            <CodeExecutionResults results={displayResults} isRunning={isRunning} />
          </TabsContent>
          
          <TabsContent value="submit" className="flex-1 mt-2 min-h-0">
            <CodeSubmissionResults result={displaySubmission} isSubmitting={isSubmitting} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
