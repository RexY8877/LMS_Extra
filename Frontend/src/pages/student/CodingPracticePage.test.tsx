/**
 * Integration tests for CodingPracticePage
 * Tests navigation flow, component interactions, and data flow between components
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import CodingPracticePage from './CodingPracticePage';

// Mock the auth store
vi.mock('@/stores/authStore', () => ({
  useAuthStore: () => ({
    user: { id: 'user123', role: 'student', name: 'Test User' },
    isAuthenticated: true,
  }),
}));

// Mock fetch globally
global.fetch = vi.fn();

const mockProblems = [
  {
    id: 1,
    title: 'Two Sum',
    difficulty: 'Easy',
    tags: ['Array', 'Hash Map'],
    companies: ['Google'],
    acceptance: 48.2,
    solved: false,
  },
  {
    id: 2,
    title: 'Reverse String',
    difficulty: 'Easy',
    tags: ['String'],
    companies: ['Amazon'],
    acceptance: 75.5,
    solved: true,
  },
];

const mockProblemDetail = {
  id: 1,
  title: 'Two Sum',
  difficulty: 'Easy',
  description: 'Given an array of integers nums and an integer target, return indices of the two numbers.',
  constraints: ['2 ≤ nums.length ≤ 10⁴'],
  examples: [
    {
      input: 'nums = [2,7,11,15], target = 9',
      output: '[0,1]',
      explanation: 'Because nums[0] + nums[1] == 9',
    },
  ],
  hints: ['Use a hash map'],
  tags: ['Array', 'Hash Map'],
  companies: ['Google'],
  acceptance: 48.2,
};

const mockTemplate = {
  template: 'def two_sum(nums, target):\n    pass',
};

const mockSubmissions = {
  submissions: [
    {
      id: 'sub1',
      status: 'Accepted',
      runtime: 45,
      memory: 14.2,
      runtimePercentile: 78,
      memoryPercentile: 65,
      testsPassed: 10,
      totalTests: 10,
      language: 'python',
      createdAt: new Date().toISOString(),
    },
  ],
};

describe('CodingPracticePage Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock responses
    (global.fetch as any).mockImplementation((url: string) => {
      if (url.includes('/api/problems?')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ problems: mockProblems }),
        });
      }
      if (url.includes('/api/problems/1')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ problem: mockProblemDetail }),
        });
      }
      if (url.includes('/template')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockTemplate,
        });
      }
      if (url.includes('/api/submissions/user/')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockSubmissions,
        });
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });
  });

  const renderPage = () => {
    return render(
      <BrowserRouter>
        <CodingPracticePage />
      </BrowserRouter>
    );
  };

  describe('Navigation Flow', () => {
    it('should render the page with header and empty state', async () => {
      renderPage();

      // Check header elements
      expect(screen.getByText('Coding Practice')).toBeInTheDocument();
      expect(screen.getByText('Solve problems • Build skills • Get hired')).toBeInTheDocument();
      expect(screen.getByText('5 day streak')).toBeInTheDocument();
      expect(screen.getByText('245 pts')).toBeInTheDocument();

      // Check empty state
      await waitFor(() => {
        expect(screen.getByText('Select a Problem')).toBeInTheDocument();
        expect(screen.getByText('Choose a problem from the list to start coding')).toBeInTheDocument();
      });
    });

    it('should load and display problem list', async () => {
      renderPage();

      await waitFor(() => {
        expect(screen.getByText('Two Sum')).toBeInTheDocument();
        expect(screen.getByText('Reverse String')).toBeInTheDocument();
      });

      expect(screen.getByText('2 total')).toBeInTheDocument();
    });

    it('should navigate from problem list to problem detail', async () => {
      renderPage();

      // Wait for problems to load
      await waitFor(() => {
        expect(screen.getByText('Two Sum')).toBeInTheDocument();
      });

      // Click on a problem
      const problemButton = screen.getByText('Two Sum').closest('button');
      await userEvent.click(problemButton!);

      // Verify problem detail loads
      await waitFor(() => {
        expect(screen.getByText('Given an array of integers nums and an integer target')).toBeInTheDocument();
      });
    });

    it('should show submission history when toggled', async () => {
      renderPage();

      // Select a problem first
      await waitFor(() => {
        expect(screen.getByText('Two Sum')).toBeInTheDocument();
      });

      const problemButton = screen.getByText('Two Sum').closest('button');
      await userEvent.click(problemButton!);

      // Wait for problem to load
      await waitFor(() => {
        expect(screen.getByText('Given an array of integers nums and an integer target')).toBeInTheDocument();
      });

      // Toggle submission history
      const historyButton = screen.getByText('Submission History');
      await userEvent.click(historyButton);

      // Verify submission history is visible
      await waitFor(() => {
        expect(screen.getByText('1 total')).toBeInTheDocument();
      });
    });
  });

  describe('Component Interactions', () => {
    it('should update problem detail when different problem is selected', async () => {
      renderPage();

      // Wait for problems to load
      await waitFor(() => {
        expect(screen.getByText('Two Sum')).toBeInTheDocument();
      });

      // Select first problem
      const firstProblem = screen.getByText('Two Sum').closest('button');
      await userEvent.click(firstProblem!);

      await waitFor(() => {
        expect(screen.getByText('Given an array of integers nums and an integer target')).toBeInTheDocument();
      });

      // Mock second problem detail
      (global.fetch as any).mockImplementation((url: string) => {
        if (url.includes('/api/problems?')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ problems: mockProblems }),
          });
        }
        if (url.includes('/api/problems/2')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              problem: {
                id: 2,
                title: 'Reverse String',
                difficulty: 'Easy',
                description: 'Write a function that reverses a string.',
                constraints: [],
                examples: [],
                hints: [],
                tags: ['String'],
                companies: ['Amazon'],
                acceptance: 75.5,
              },
            }),
          });
        }
        if (url.includes('/template')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ template: 'def reverse_string(s):\n    pass' }),
          });
        }
        if (url.includes('/api/submissions/user/')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ submissions: [] }),
          });
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Select second problem
      const secondProblem = screen.getByText('Reverse String').closest('button');
      await userEvent.click(secondProblem!);

      // Verify new problem detail loads
      await waitFor(() => {
        expect(screen.getByText('Write a function that reverses a string.')).toBeInTheDocument();
      });
    });

    it('should load code template when problem is selected', async () => {
      renderPage();

      await waitFor(() => {
        expect(screen.getByText('Two Sum')).toBeInTheDocument();
      });

      const problemButton = screen.getByText('Two Sum').closest('button');
      await userEvent.click(problemButton!);

      // Verify template endpoint was called
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/problems/1/template?language=python')
        );
      });
    });

    it('should highlight selected problem in browser', async () => {
      renderPage();

      await waitFor(() => {
        expect(screen.getByText('Two Sum')).toBeInTheDocument();
      });

      const problemButton = screen.getByText('Two Sum').closest('button');
      await userEvent.click(problemButton!);

      await waitFor(() => {
        expect(problemButton).toHaveClass('bg-muted');
      });
    });

    it('should collapse and expand submission history', async () => {
      renderPage();

      // Select a problem
      await waitFor(() => {
        expect(screen.getByText('Two Sum')).toBeInTheDocument();
      });

      const problemButton = screen.getByText('Two Sum').closest('button');
      await userEvent.click(problemButton!);

      await waitFor(() => {
        expect(screen.getByText('Submission History')).toBeInTheDocument();
      });

      // Expand
      const historyButton = screen.getByText('Submission History');
      await userEvent.click(historyButton);

      await waitFor(() => {
        expect(screen.getByText('1 total')).toBeInTheDocument();
      });

      // Collapse
      await userEvent.click(historyButton);

      await waitFor(() => {
        expect(screen.queryByText('1 total')).not.toBeInTheDocument();
      });
    });
  });

  describe('Data Flow Between Components', () => {
    it('should pass selected problem ID to all child components', async () => {
      renderPage();

      await waitFor(() => {
        expect(screen.getByText('Two Sum')).toBeInTheDocument();
      });

      const problemButton = screen.getByText('Two Sum').closest('button');
      await userEvent.click(problemButton!);

      // Verify all components receive the problem ID
      await waitFor(() => {
        // ProblemDetail should fetch problem 1
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/problems/1')
        );
        
        // CodeEditor should fetch template for problem 1
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/problems/1/template')
        );
        
        // SubmissionHistory should fetch submissions for problem 1
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/submissions/user/user123/problem/1')
        );
      });
    });

    it('should pass user ID to components that need it', async () => {
      renderPage();

      await waitFor(() => {
        expect(screen.getByText('Two Sum')).toBeInTheDocument();
      });

      const problemButton = screen.getByText('Two Sum').closest('button');
      await userEvent.click(problemButton!);

      // Verify user ID is passed to submission history
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/submissions/user/user123/problem/1')
        );
      });
    });

    it('should maintain state when switching between problems', async () => {
      renderPage();

      await waitFor(() => {
        expect(screen.getByText('Two Sum')).toBeInTheDocument();
      });

      // Select first problem
      const firstProblem = screen.getByText('Two Sum').closest('button');
      await userEvent.click(firstProblem!);

      await waitFor(() => {
        expect(screen.getByText('Given an array of integers nums and an integer target')).toBeInTheDocument();
      });

      // Expand submission history
      const historyButton = screen.getByText('Submission History');
      await userEvent.click(historyButton);

      await waitFor(() => {
        expect(screen.getByText('1 total')).toBeInTheDocument();
      });

      // Select second problem
      const secondProblem = screen.getByText('Reverse String').closest('button');
      await userEvent.click(secondProblem!);

      // Submission history should still be expanded
      await waitFor(() => {
        expect(screen.getByText('Submission History')).toBeInTheDocument();
      });
    });

    it('should handle empty problem selection gracefully', async () => {
      renderPage();

      // Initially no problem selected
      expect(screen.getByText('Select a Problem')).toBeInTheDocument();
      expect(screen.getByText('Code editor will appear here')).toBeInTheDocument();

      // Submission history button should not appear
      expect(screen.queryByText('Submission History')).not.toBeInTheDocument();
    });
  });

  describe('Responsive Layout', () => {
    it('should render all main sections', async () => {
      renderPage();

      await waitFor(() => {
        expect(screen.getByText('Two Sum')).toBeInTheDocument();
      });

      // Check that all main sections are present
      expect(screen.getByText('Problems')).toBeInTheDocument();
      expect(screen.getByText('Select a Problem')).toBeInTheDocument();
      expect(screen.getByText('Code editor will appear here')).toBeInTheDocument();
    });

    it('should maintain layout structure with selected problem', async () => {
      renderPage();

      await waitFor(() => {
        expect(screen.getByText('Two Sum')).toBeInTheDocument();
      });

      const problemButton = screen.getByText('Two Sum').closest('button');
      await userEvent.click(problemButton!);

      await waitFor(() => {
        // Problem browser still visible
        expect(screen.getByText('Problems')).toBeInTheDocument();
        
        // Problem detail visible
        expect(screen.getByText('Given an array of integers nums and an integer target')).toBeInTheDocument();
        
        // Code editor visible (check for language selector)
        expect(screen.getByRole('combobox')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle problem list fetch error', async () => {
      (global.fetch as any).mockImplementation((url: string) => {
        if (url.includes('/api/problems?')) {
          return Promise.reject(new Error('Network error'));
        }
        return Promise.resolve({ ok: true, json: async () => ({}) });
      });

      renderPage();

      await waitFor(() => {
        expect(screen.getByText(/Error: Network error/i)).toBeInTheDocument();
      });
    });

    it('should handle problem detail fetch error', async () => {
      (global.fetch as any).mockImplementation((url: string) => {
        if (url.includes('/api/problems?')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ problems: mockProblems }),
          });
        }
        if (url.includes('/api/problems/1')) {
          return Promise.reject(new Error('Problem not found'));
        }
        return Promise.resolve({ ok: true, json: async () => ({}) });
      });

      renderPage();

      await waitFor(() => {
        expect(screen.getByText('Two Sum')).toBeInTheDocument();
      });

      const problemButton = screen.getByText('Two Sum').closest('button');
      await userEvent.click(problemButton!);

      await waitFor(() => {
        expect(screen.getByText(/Error: Problem not found/i)).toBeInTheDocument();
      });
    });

    it('should handle submission history fetch error gracefully', async () => {
      (global.fetch as any).mockImplementation((url: string) => {
        if (url.includes('/api/problems?')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ problems: mockProblems }),
          });
        }
        if (url.includes('/api/problems/1')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ problem: mockProblemDetail }),
          });
        }
        if (url.includes('/template')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockTemplate,
          });
        }
        if (url.includes('/api/submissions/user/')) {
          return Promise.reject(new Error('Failed to fetch submissions'));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      renderPage();

      await waitFor(() => {
        expect(screen.getByText('Two Sum')).toBeInTheDocument();
      });

      const problemButton = screen.getByText('Two Sum').closest('button');
      await userEvent.click(problemButton!);

      // Expand submission history
      await waitFor(() => {
        expect(screen.getByText('Submission History')).toBeInTheDocument();
      });

      const historyButton = screen.getByText('Submission History');
      await userEvent.click(historyButton);

      // Should show error in submission history
      await waitFor(() => {
        expect(screen.getByText(/Error: Failed to fetch submissions/i)).toBeInTheDocument();
      });
    });
  });
});
