/**
 * Unit tests for ProblemBrowser component
 * 
 * Note: These tests require a testing framework to be set up.
 * Install dependencies: npm install --save-dev vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
 * Add to package.json scripts: "test": "vitest"
 * Create vitest.config.ts with React testing configuration
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProblemBrowser, Problem } from './ProblemBrowser';

// Mock fetch globally
global.fetch = vi.fn();

const mockProblems: Problem[] = [
  {
    id: 1,
    title: 'Two Sum',
    difficulty: 'Easy',
    tags: ['Array', 'Hash Map'],
    companies: ['Google', 'Amazon'],
    acceptance: 48.2,
    solved: true,
  },
  {
    id: 2,
    title: 'Longest Substring',
    difficulty: 'Medium',
    tags: ['String', 'Sliding Window'],
    companies: ['Amazon'],
    acceptance: 33.8,
    solved: false,
  },
  {
    id: 3,
    title: 'Merge K Sorted Lists',
    difficulty: 'Hard',
    tags: ['Linked List', 'Heap'],
    companies: ['Facebook'],
    acceptance: 47.4,
    solved: false,
  },
];

describe('ProblemBrowser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ problems: mockProblems }),
    });
  });

  describe('Filter State Management', () => {
    it('should initialize with default filter states', async () => {
      render(<ProblemBrowser />);
      
      await waitFor(() => {
        expect(screen.getByText('3 total')).toBeInTheDocument();
      });
      
      // Check that all problems are displayed initially
      expect(screen.getByText('Two Sum')).toBeInTheDocument();
      expect(screen.getByText('Longest Substring')).toBeInTheDocument();
      expect(screen.getByText('Merge K Sorted Lists')).toBeInTheDocument();
    });

    it('should filter problems by difficulty', async () => {
      render(<ProblemBrowser />);
      
      await waitFor(() => {
        expect(screen.getByText('3 total')).toBeInTheDocument();
      });
      
      // Open filter popover
      const filterButton = screen.getByRole('button', { name: /filter/i });
      await userEvent.click(filterButton);
      
      // Select Easy difficulty
      const difficultySelect = screen.getByRole('combobox', { name: /difficulty/i });
      await userEvent.click(difficultySelect);
      await userEvent.click(screen.getByText('Easy'));
      
      // Verify API was called with difficulty filter
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('difficulty=Easy')
        );
      });
    });

    it('should filter problems by tags', async () => {
      render(<ProblemBrowser />);
      
      await waitFor(() => {
        expect(screen.getByText('3 total')).toBeInTheDocument();
      });
      
      // Open filter popover
      const filterButton = screen.getByRole('button', { name: /filter/i });
      await userEvent.click(filterButton);
      
      // Select a tag
      const arrayCheckbox = screen.getByLabelText('Array');
      await userEvent.click(arrayCheckbox);
      
      // Verify API was called with tag filter
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('tags=Array')
        );
      });
    });

    it('should search problems by title with debouncing', async () => {
      vi.useFakeTimers();
      render(<ProblemBrowser />);
      
      await waitFor(() => {
        expect(screen.getByText('3 total')).toBeInTheDocument();
      });
      
      const searchInput = screen.getByPlaceholderText('Search problems...');
      
      // Type search query
      await userEvent.type(searchInput, 'Two Sum');
      
      // Should not call API immediately
      expect(global.fetch).not.toHaveBeenCalledWith(
        expect.stringContaining('search=Two Sum')
      );
      
      // Fast-forward debounce timer
      vi.advanceTimersByTime(300);
      
      // Now API should be called
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('search=Two%20Sum')
        );
      });
      
      vi.useRealTimers();
    });

    it('should sort problems by selected criterion', async () => {
      render(<ProblemBrowser />);
      
      await waitFor(() => {
        expect(screen.getByText('3 total')).toBeInTheDocument();
      });
      
      // Find and click sort dropdown
      const sortSelect = screen.getByRole('combobox', { name: /sort by/i });
      await userEvent.click(sortSelect);
      await userEvent.click(screen.getByText('Acceptance Rate'));
      
      // Verify API was called with sort parameter
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('sortBy=acceptance')
        );
      });
    });

    it('should clear all filters when clear button is clicked', async () => {
      render(<ProblemBrowser />);
      
      await waitFor(() => {
        expect(screen.getByText('3 total')).toBeInTheDocument();
      });
      
      // Apply filters
      const filterButton = screen.getByRole('button', { name: /filter/i });
      await userEvent.click(filterButton);
      
      const difficultySelect = screen.getByRole('combobox', { name: /difficulty/i });
      await userEvent.click(difficultySelect);
      await userEvent.click(screen.getByText('Easy'));
      
      // Clear filters
      const clearButton = screen.getByText('Clear all');
      await userEvent.click(clearButton);
      
      // Verify filters are reset
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('sortBy=difficulty')
        );
        expect(global.fetch).not.toHaveBeenCalledWith(
          expect.stringContaining('difficulty=Easy')
        );
      });
    });

    it('should combine multiple filters', async () => {
      render(<ProblemBrowser />);
      
      await waitFor(() => {
        expect(screen.getByText('3 total')).toBeInTheDocument();
      });
      
      // Open filter popover
      const filterButton = screen.getByRole('button', { name: /filter/i });
      await userEvent.click(filterButton);
      
      // Select difficulty
      const difficultySelect = screen.getByRole('combobox', { name: /difficulty/i });
      await userEvent.click(difficultySelect);
      await userEvent.click(screen.getByText('Medium'));
      
      // Select tag
      const stringCheckbox = screen.getByLabelText('String');
      await userEvent.click(stringCheckbox);
      
      // Verify API was called with both filters
      await waitFor(() => {
        const lastCall = (global.fetch as any).mock.calls.slice(-1)[0][0];
        expect(lastCall).toContain('difficulty=Medium');
        expect(lastCall).toContain('tags=String');
      });
    });
  });

  describe('API Integration', () => {
    it('should fetch problems on mount', async () => {
      render(<ProblemBrowser />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/problems')
        );
      });
      
      expect(screen.getByText('3 total')).toBeInTheDocument();
    });

    it('should display loading state while fetching', () => {
      (global.fetch as any).mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 1000))
      );
      
      render(<ProblemBrowser />);
      
      expect(screen.getByText('Loading problems...')).toBeInTheDocument();
    });

    it('should display problems after successful fetch', async () => {
      render(<ProblemBrowser />);
      
      await waitFor(() => {
        expect(screen.getByText('Two Sum')).toBeInTheDocument();
        expect(screen.getByText('Longest Substring')).toBeInTheDocument();
        expect(screen.getByText('Merge K Sorted Lists')).toBeInTheDocument();
      });
    });

    it('should display problem details correctly', async () => {
      render(<ProblemBrowser />);
      
      await waitFor(() => {
        expect(screen.getByText('Two Sum')).toBeInTheDocument();
      });
      
      // Check difficulty badge
      expect(screen.getByText('Easy')).toBeInTheDocument();
      
      // Check acceptance rate
      expect(screen.getByText('48.2%')).toBeInTheDocument();
      
      // Check tags
      expect(screen.getByText('Array')).toBeInTheDocument();
      expect(screen.getByText('Hash Map')).toBeInTheDocument();
    });

    it('should show solved indicator for completed problems', async () => {
      render(<ProblemBrowser />);
      
      await waitFor(() => {
        expect(screen.getByText('Two Sum')).toBeInTheDocument();
      });
      
      // Two Sum is marked as solved
      const solvedIcon = screen.getAllByTestId('check-circle-icon')[0];
      expect(solvedIcon).toBeInTheDocument();
    });

    it('should call onProblemSelect when problem is clicked', async () => {
      const onProblemSelect = vi.fn();
      render(<ProblemBrowser onProblemSelect={onProblemSelect} />);
      
      await waitFor(() => {
        expect(screen.getByText('Two Sum')).toBeInTheDocument();
      });
      
      const problemButton = screen.getByText('Two Sum').closest('button');
      await userEvent.click(problemButton!);
      
      expect(onProblemSelect).toHaveBeenCalledWith(1);
    });

    it('should highlight selected problem', async () => {
      render(<ProblemBrowser selectedProblemId={1} />);
      
      await waitFor(() => {
        expect(screen.getByText('Two Sum')).toBeInTheDocument();
      });
      
      const selectedProblem = screen.getByText('Two Sum').closest('button');
      expect(selectedProblem).toHaveClass('bg-muted');
    });
  });

  describe('Error Handling', () => {
    it('should display error message when fetch fails', async () => {
      (global.fetch as any).mockRejectedValue(new Error('Network error'));
      
      render(<ProblemBrowser />);
      
      await waitFor(() => {
        expect(screen.getByText(/Error: Network error/i)).toBeInTheDocument();
      });
    });

    it('should display error message when API returns error', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: false,
        status: 500,
      });
      
      render(<ProblemBrowser />);
      
      await waitFor(() => {
        expect(screen.getByText(/Error: Failed to fetch problems/i)).toBeInTheDocument();
      });
    });

    it('should show retry button on error', async () => {
      (global.fetch as any).mockRejectedValue(new Error('Network error'));
      
      render(<ProblemBrowser />);
      
      await waitFor(() => {
        expect(screen.getByText('Retry')).toBeInTheDocument();
      });
    });

    it('should display empty state when no problems found', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ problems: [] }),
      });
      
      render(<ProblemBrowser />);
      
      await waitFor(() => {
        expect(screen.getByText('No problems found')).toBeInTheDocument();
      });
    });

    it('should handle missing problem data gracefully', async () => {
      const incompleteProblems = [
        {
          id: 1,
          title: 'Test Problem',
          difficulty: 'Easy',
          tags: [],
          companies: [],
          acceptance: 0,
        },
      ];
      
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ problems: incompleteProblems }),
      });
      
      render(<ProblemBrowser />);
      
      await waitFor(() => {
        expect(screen.getByText('Test Problem')).toBeInTheDocument();
      });
      
      // Should not crash with missing data
      expect(screen.getByText('0%')).toBeInTheDocument();
    });
  });

  describe('UI Interactions', () => {
    it('should show filter indicator when filters are active', async () => {
      render(<ProblemBrowser />);
      
      await waitFor(() => {
        expect(screen.getByText('3 total')).toBeInTheDocument();
      });
      
      // Apply a filter
      const filterButton = screen.getByRole('button', { name: /filter/i });
      await userEvent.click(filterButton);
      
      const difficultySelect = screen.getByRole('combobox', { name: /difficulty/i });
      await userEvent.click(difficultySelect);
      await userEvent.click(screen.getByText('Easy'));
      
      // Check for filter indicator (red dot)
      const filterButtonWithIndicator = screen.getByRole('button', { name: /filter/i });
      const indicator = filterButtonWithIndicator.querySelector('.bg-primary');
      expect(indicator).toBeInTheDocument();
    });

    it('should display active filter badges', async () => {
      render(<ProblemBrowser />);
      
      await waitFor(() => {
        expect(screen.getByText('3 total')).toBeInTheDocument();
      });
      
      // Apply difficulty filter
      const filterButton = screen.getByRole('button', { name: /filter/i });
      await userEvent.click(filterButton);
      
      const difficultySelect = screen.getByRole('combobox', { name: /difficulty/i });
      await userEvent.click(difficultySelect);
      await userEvent.click(screen.getByText('Medium'));
      
      // Check for filter badge
      await waitFor(() => {
        const badges = screen.getAllByText('Medium');
        expect(badges.length).toBeGreaterThan(0);
      });
    });

    it('should remove individual filter badges when X is clicked', async () => {
      render(<ProblemBrowser />);
      
      await waitFor(() => {
        expect(screen.getByText('3 total')).toBeInTheDocument();
      });
      
      // Apply filter
      const filterButton = screen.getByRole('button', { name: /filter/i });
      await userEvent.click(filterButton);
      
      const difficultySelect = screen.getByRole('combobox', { name: /difficulty/i });
      await userEvent.click(difficultySelect);
      await userEvent.click(screen.getByText('Easy'));
      
      // Find and click X on badge
      await waitFor(() => {
        const badge = screen.getByText('Easy').closest('.badge');
        const xButton = badge?.querySelector('svg');
        if (xButton) {
          fireEvent.click(xButton);
        }
      });
      
      // Verify filter was removed
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.not.stringContaining('difficulty=Easy')
        );
      });
    });
  });
});
