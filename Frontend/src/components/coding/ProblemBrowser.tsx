import { useState, useEffect, useMemo } from 'react';
import { Search, Filter, CheckCircle2, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { DifficultyBadge } from '@/components/dashboard/SkillWidgets';

export interface Problem {
  id: string | number;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
  companies: string[];
  acceptance: number;
  solved?: boolean;
}

interface ProblemBrowserProps {
  onProblemSelect?: (problemId: string | number) => void;
  selectedProblemId?: string | number;
}

export const ProblemBrowser = ({ onProblemSelect, selectedProblemId }: ProblemBrowserProps) => {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [difficulty, setDifficulty] = useState<string>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'difficulty' | 'acceptance' | 'title'>('difficulty');
  
  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Fetch problems from API
  useEffect(() => {
    const fetchProblems = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const params = new URLSearchParams();
        
        if (difficulty !== 'all') {
          params.append('difficulty', difficulty);
        }
        
        if (selectedTags.length > 0) {
          params.append('tags', selectedTags.join(','));
        }
        
        if (debouncedSearch) {
          params.append('search', debouncedSearch);
        }
        
        params.append('sortBy', sortBy);
        
        const response = await fetch(`/api/problems?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch problems');
        }
        
        const data = await response.json();
        setProblems(data.problems || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching problems:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProblems();
  }, [difficulty, selectedTags, debouncedSearch, sortBy]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Get unique tags from all problems
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    problems.forEach(problem => {
      problem.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [problems]);

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setDifficulty('all');
    setSelectedTags([]);
    setSearchQuery('');
  };

  const hasActiveFilters = difficulty !== 'all' || selectedTags.length > 0 || searchQuery !== '';

  return (
    <Card className="flex flex-col overflow-hidden h-full">
      <CardHeader className="pb-3 shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Problems</CardTitle>
          <Badge variant="secondary">{problems.length} total</Badge>
        </div>
        
        {/* Search and Filter Controls */}
        <div className="space-y-2 mt-2">
          {/* Search Input */}
          <div className="relative flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search problems..."
                className="pl-8 h-8 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {/* Filter Popover */}
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8 shrink-0 relative"
                >
                  <Filter className="h-4 w-4" />
                  {hasActiveFilters && (
                    <span className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full" />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64" align="end">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">Filters</h4>
                    {hasActiveFilters && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="h-auto p-0 text-xs"
                      >
                        Clear all
                      </Button>
                    )}
                  </div>
                  
                  {/* Difficulty Filter */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium">Difficulty</label>
                    <Select value={difficulty} onValueChange={setDifficulty}>
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="Easy">Easy</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Tag Filter */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium">Tags</label>
                    <div className="max-h-48 overflow-y-auto space-y-2">
                      {availableTags.map(tag => (
                        <div key={tag} className="flex items-center space-x-2">
                          <Checkbox
                            id={`tag-${tag}`}
                            checked={selectedTags.includes(tag)}
                            onCheckedChange={() => handleTagToggle(tag)}
                          />
                          <label
                            htmlFor={`tag-${tag}`}
                            className="text-sm cursor-pointer flex-1"
                          >
                            {tag}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          
          {/* Sort Dropdown */}
          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="h-8 text-sm">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="difficulty">Difficulty</SelectItem>
              <SelectItem value="acceptance">Acceptance Rate</SelectItem>
              <SelectItem value="title">Title</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-1">
              {difficulty !== 'all' && (
                <Badge variant="secondary" className="text-xs">
                  {difficulty}
                  <X
                    className="ml-1 h-3 w-3 cursor-pointer"
                    onClick={() => setDifficulty('all')}
                  />
                </Badge>
              )}
              {selectedTags.map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                  <X
                    className="ml-1 h-3 w-3 cursor-pointer"
                    onClick={() => handleTagToggle(tag)}
                  />
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-auto p-0">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-sm text-muted-foreground">Loading problems...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-32 px-4">
            <p className="text-sm text-destructive mb-2">Error: {error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </div>
        ) : problems.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-sm text-muted-foreground">No problems found</p>
          </div>
        ) : (
          <div className="divide-y">
            {problems.map((problem) => (
              <button
                key={problem.id}
                onClick={() => onProblemSelect?.(problem.id)}
                className={`w-full text-left p-3 hover:bg-muted/50 transition-colors ${
                  selectedProblemId === problem.id ? 'bg-muted' : ''
                }`}
              >
                <div className="flex items-start gap-2">
                  <div className="mt-0.5">
                    {problem.solved ? (
                      <CheckCircle2 className="h-4 w-4 text-success" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{problem.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <DifficultyBadge difficulty={problem.difficulty as any} />
                      <span className="text-xs text-muted-foreground">
                        {problem.acceptance}%
                      </span>
                    </div>
                    {problem.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {problem.tags.slice(0, 2).map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {problem.tags.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{problem.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
