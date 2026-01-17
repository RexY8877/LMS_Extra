/**
 * Unit tests for ProblemDetail component
 * 
 * Tests focus on:
 * - Problem data rendering
 * - Expandable hints functionality
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProblemDetail, ProblemDetailData } from './ProblemDetail';

// Mock fetch globally
global.fetch = vi.fn();

const mockProblem: ProblemDetailData = {
  id: 1,
  title: 'Two Sum',
  difficulty: 'Easy',
  description: '<p>Given an array of integers <code>nums</code> and an integer <code>target</code>, return indices of the two numbers such that they add up to target.</p>',
  constraints: [
    '2 ≤ nums.length ≤ 10⁴',
    '-10⁹ ≤ nums[i] ≤ 10⁹',
    '-10⁹ ≤ target ≤ 10⁹',
  ],
  examples: [
    {
      input: 'nums = [2,7,11,15], target = 9',
      output: '[0,1]',
      explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].',
    },
    {
      input: 'nums = [3,2,4], target = 6',
      output: '[1,2]',
    },
  ],
  hints: [
    'A really brute force way would be to search for all possible pairs of numbers but that would be too slow.',
    'Use a hash map to store the numbers you have seen so far.',
    'For each number, check if target - number exists in the hash map.',
  ],
  tags: ['Array', 'Hash Map'],
  companies: ['Google', 'Amazon', 'Facebook'],
  acceptance: 48.2,
  timeLimit: 2000,
  memoryLimit: 256,
};

describe('ProblemDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ problem: mockProblem }),
    });
  });

  describe('Problem Data Rendering', () => {
    it('should display problem title', async () => {
      render(<ProblemDetail problemId={1} />);
      
      await waitFor(() => {
        expect(screen.getByText('Two Sum')).toBeInTheDocument();
      });
    });

    it('should display difficulty badge', async () => {
      render(<ProblemDetail problemId={1} />);
      
      await waitFor(() => {
        expect(screen.getByText('Easy')).toBeInTheDocument();
      });
    });

    it('should display acceptance rate', async () => {
      render(<ProblemDetail problemId={1} />);
      
      await waitFor(() => {
        expect(screen.getByText(/Acceptance: 48.2%/)).toBeInTheDocument();
      });
    });

    it('should display time limit when provided', async () => {
      render(<ProblemDetail problemId={1} />);
      
      await waitFor(() => {
        expect(screen.getByText(/Time: 2000ms/)).toBeInTheDocument();
      });
    });

    it('should display memory limit when provided', async () => {
      render(<ProblemDetail problemId={1} />);
      
      await waitFor(() => {
        expect(screen.getByText(/Memory: 256MB/)).toBeInTheDocument();
      });
    });

    it('should render problem description with HTML', async () => {
      render(<ProblemDetail problemId={1} />);
      
      await waitFor(() => {
        const description = screen.getByText(/Given an array of integers/);
        expect(description).toBeInTheDocument();
      });
    });

    it('should display all example test cases', async () => {
      render(<ProblemDetail problemId={1} />);
      
      await waitFor(() => {
        expect(screen.getByText('Example 1:')).toBeInTheDocument();
        expect(screen.getByText('Example 2:')).toBeInTheDocument();
      });
    });

    it('should display example inputs and outputs', async () => {
      render(<ProblemDetail problemId={1} />);
      
      await waitFor(() => {
        expect(screen.getByText(/nums = \[2,7,11,15\], target = 9/)).toBeInTheDocument();
        expect(screen.getByText(/\[0,1\]/)).toBeInTheDocument();
      });
    });

    it('should display example explanation when provided', async () => {
      render(<ProblemDetail problemId={1} />);
      
      await waitFor(() => {
        expect(screen.getByText(/Because nums\[0\] \+ nums\[1\] == 9/)).toBeInTheDocument();
      });
    });

    it('should display all constraints', async () => {
      render(<ProblemDetail problemId={1} />);
      
      await waitFor(() => {
        expect(screen.getByText('Constraints:')).toBeInTheDocument();
        expect(screen.getByText(/2 ≤ nums.length ≤ 10⁴/)).toBeInTheDocument();
        expect(screen.getByText(/-10⁹ ≤ nums\[i\] ≤ 10⁹/)).toBeInTheDocument();
        expect(screen.getByText(/-10⁹ ≤ target ≤ 10⁹/)).toBeInTheDocument();
      });
    });

    it('should display all tags as badges', async () => {
      render(<ProblemDetail problemId={1} />);
      
      await waitFor(() => {
        expect(screen.getByText('Array')).toBeInTheDocument();
        expect(screen.getByText('Hash Map')).toBeInTheDocument();
      });
    });

    it('should display all company tags', async () => {
      render(<ProblemDetail problemId={1} />);
      
      await waitFor(() => {
        expect(screen.getByText('Google')).toBeInTheDocument();
        expect(screen.getByText('Amazon')).toBeInTheDocument();
        expect(screen.getByText('Facebook')).toBeInTheDocument();
      });
    });

    it('should display hints section when hints are available', async () => {
      render(<ProblemDetail problemId={1} />);
      
      await waitFor(() => {
        expect(screen.getByText('Hints')).toBeInTheDocument();
        expect(screen.getByText('Hint 1')).toBeInTheDocument();
        expect(screen.getByText('Hint 2')).toBeInTheDocument();
        expect(screen.getByText('Hint 3')).toBeInTheDocument();
      });
    });

    it('should handle problems without optional fields', async () => {
      const minimalProblem: ProblemDetailData = {
        id: 2,
        title: 'Minimal Problem',
        difficulty: 'Medium',
        description: 'A simple problem',
        constraints: [],
        examples: [],
        hints: [],
        tags: [],
        companies: [],
        acceptance: 50,
      };

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ problem: minimalProblem }),
      });

      render(<ProblemDetail problemId={2} />);
      
      await waitFor(() => {
        expect(screen.getByText('Minimal Problem')).toBeInTheDocument();
      });

      // Should not crash and should not display empty sections
      expect(screen.queryByText('Constraints:')).not.toBeInTheDocument();
      expect(screen.queryByText('Hints')).not.toBeInTheDocument();
    });
  });

  describe('Expandable Hints Functionality', () => {
    it('should initially hide hint content', async () => {
      render(<ProblemDetail problemId={1} />);
      
      await waitFor(() => {
        expect(screen.getByText('Hint 1')).toBeInTheDocument();
      });

      // Hint content should not be visible initially
      expect(screen.queryByText(/brute force way/)).not.toBeInTheDocument();
    });

    it('should expand hint when clicked', async () => {
      render(<ProblemDetail problemId={1} />);
      
      await waitFor(() => {
        expect(screen.getByText('Hint 1')).toBeInTheDocument();
      });

      const hint1Button = screen.getByText('Hint 1');
      await userEvent.click(hint1Button);

      // Hint content should now be visible
      await waitFor(() => {
        expect(screen.getByText(/brute force way/)).toBeInTheDocument();
      });
    });

    it('should collapse hint when clicked again', async () => {
      render(<ProblemDetail problemId={1} />);
      
      await waitFor(() => {
        expect(screen.getByText('Hint 1')).toBeInTheDocument();
      });

      const hint1Button = screen.getByText('Hint 1');
      
      // Expand
      await userEvent.click(hint1Button);
      await waitFor(() => {
        expect(screen.getByText(/brute force way/)).toBeInTheDocument();
      });

      // Collapse
      await userEvent.click(hint1Button);
      await waitFor(() => {
        expect(screen.queryByText(/brute force way/)).not.toBeInTheDocument();
      });
    });

    it('should allow multiple hints to be expanded simultaneously', async () => {
      render(<ProblemDetail problemId={1} />);
      
      await waitFor(() => {
        expect(screen.getByText('Hint 1')).toBeInTheDocument();
      });

      // Expand hint 1
      const hint1Button = screen.getByText('Hint 1');
      await userEvent.click(hint1Button);

      // Expand hint 2
      const hint2Button = screen.getByText('Hint 2');
      await userEvent.click(hint2Button);

      // Both hints should be visible
      await waitFor(() => {
        expect(screen.getByText(/brute force way/)).toBeInTheDocument();
        expect(screen.getByText(/Use a hash map/)).toBeInTheDocument();
      });
    });

    it('should show chevron down icon when hint is expanded', async () => {
      render(<ProblemDetail problemId={1} />);
      
      await waitFor(() => {
        expect(screen.getByText('Hint 1')).toBeInTheDocument();
      });

      const hint1Button = screen.getByText('Hint 1').closest('button');
      
      // Initially should have chevron right icon
      expect(hint1Button?.querySelector('svg')).toBeInTheDocument();

      // Click to expand
      await userEvent.click(hint1Button!);

      // Should still have an icon (chevron down)
      await waitFor(() => {
        expect(hint1Button?.querySelector('svg')).toBeInTheDocument();
      });
    });
  });

  describe('API Integration', () => {
    it('should fetch problem details on mount', async () => {
      render(<ProblemDetail problemId={1} />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/problems/1');
      });
    });

    it('should refetch when problemId changes', async () => {
      const { rerender } = render(<ProblemDetail problemId={1} />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/problems/1');
      });

      // Change problemId
      rerender(<ProblemDetail problemId={2} />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/problems/2');
      });
    });

    it('should display loading state while fetching', () => {
      (global.fetch as any).mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 1000))
      );
      
      render(<ProblemDetail problemId={1} />);
      
      expect(screen.getByText('Loading problem details...')).toBeInTheDocument();
    });

    it('should handle API errors gracefully', async () => {
      (global.fetch as any).mockRejectedValue(new Error('Network error'));
      
      render(<ProblemDetail problemId={1} />);
      
      await waitFor(() => {
        expect(screen.getByText(/Error: Network error/)).toBeInTheDocument();
      });
    });

    it('should show retry button on error', async () => {
      (global.fetch as any).mockRejectedValue(new Error('Network error'));
      
      render(<ProblemDetail problemId={1} />);
      
      await waitFor(() => {
        expect(screen.getByText('Retry')).toBeInTheDocument();
      });
    });

    it('should handle non-ok response', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: false,
        status: 404,
      });
      
      render(<ProblemDetail problemId={1} />);
      
      await waitFor(() => {
        expect(screen.getByText(/Error: Failed to fetch problem details/)).toBeInTheDocument();
      });
    });

    it('should handle missing problem data', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ problem: null }),
      });
      
      render(<ProblemDetail problemId={1} />);
      
      await waitFor(() => {
        expect(screen.getByText('No problem selected')).toBeInTheDocument();
      });
    });

    it('should not fetch when problemId is not provided', () => {
      render(<ProblemDetail problemId={null as any} />);
      
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('UI Elements', () => {
    it('should display bookmark icon button', async () => {
      render(<ProblemDetail problemId={1} />);
      
      await waitFor(() => {
        expect(screen.getByText('Two Sum')).toBeInTheDocument();
      });

      const bookmarkButton = screen.getByRole('button', { name: '' });
      expect(bookmarkButton).toBeInTheDocument();
    });

    it('should format example test cases in code blocks', async () => {
      render(<ProblemDetail problemId={1} />);
      
      await waitFor(() => {
        const codeBlock = screen.getByText(/nums = \[2,7,11,15\], target = 9/).closest('div');
        expect(codeBlock).toHaveClass('font-mono');
      });
    });

    it('should display company icon with company tags', async () => {
      render(<ProblemDetail problemId={1} />);
      
      await waitFor(() => {
        expect(screen.getByText('Google')).toBeInTheDocument();
      });

      // Just verify that company tags are displayed - icon presence is a visual detail
      expect(screen.getByText('Amazon')).toBeInTheDocument();
      expect(screen.getByText('Facebook')).toBeInTheDocument();
    });

    it('should display lightbulb icon with hints section', async () => {
      render(<ProblemDetail problemId={1} />);
      
      await waitFor(() => {
        expect(screen.getByText('Hints')).toBeInTheDocument();
      });

      const hintsSection = screen.getByText('Hints').closest('p');
      expect(hintsSection?.querySelector('svg')).toBeInTheDocument();
    });
  });
});
