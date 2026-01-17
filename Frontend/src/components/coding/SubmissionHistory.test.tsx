import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SubmissionHistory, SubmissionHistoryItem } from './SubmissionHistory';

// Mock fetch globally
global.fetch = vi.fn();

const mockSubmissions: SubmissionHistoryItem[] = [
  {
    id: 'sub-1',
    status: 'Accepted',
    runtime: 45,
    memory: 12.5,
    runtimePercentile: 85.3,
    memoryPercentile: 78.2,
    testsPassed: 10,
    totalTests: 10,
    language: 'python',
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
  },
  {
    id: 'sub-2',
    status: 'Wrong Answer',
    runtime: 50,
    memory: 13.0,
    testsPassed: 8,
    totalTests: 10,
    language: 'javascript',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
  },
  {
    id: 'sub-3',
    status: 'Time Limit Exceeded',
    testsPassed: 5,
    totalTests: 10,
    language: 'java',
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
  },
  {
    id: 'sub-4',
    status: 'Runtime Error',
    testsPassed: 0,
    totalTests: 10,
    language: 'python',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
  },
];

describe('SubmissionHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ submissions: mockSubmissions }),
    });
  });

  describe('Submission List Rendering', () => {
    it('should render submission history on mount', async () => {
      render(<SubmissionHistory problemId="prob-1" userId="user-1" />);

      await waitFor(() => {
        expect(screen.getByText('4 total')).toBeInTheDocument();
      });

      // Check that all submissions are displayed
      expect(screen.getByText('Accepted')).toBeInTheDocument();
      expect(screen.getByText('Wrong Answer')).toBeInTheDocument();
      expect(screen.getByText('Time Limit Exceeded')).toBeInTheDocument();
      expect(screen.getByText('Runtime Error')).toBeInTheDocument();
    });

    it('should display submission details correctly', async () => {
      render(<SubmissionHistory problemId="prob-1" userId="user-1" />);

      await waitFor(() => {
        expect(screen.getByText('4 total')).toBeInTheDocument();
      });

      // Check test results
      expect(screen.getByText('10/10 test cases passed')).toBeInTheDocument();
      expect(screen.getByText('8/10 test cases passed')).toBeInTheDocument();

      // Check languages (use getAllByText since there are multiple instances)
      expect(screen.getAllByText('Python').length).toBeGreaterThan(0);
      expect(screen.getByText('JavaScript')).toBeInTheDocument();
      expect(screen.getByText('Java')).toBeInTheDocument();
    });

    it('should display performance metrics for accepted submissions', async () => {
      render(<SubmissionHistory problemId="prob-1" userId="user-1" />);

      await waitFor(() => {
        expect(screen.getByText('45ms')).toBeInTheDocument();
      });

      // Check runtime and memory
      expect(screen.getByText('45ms')).toBeInTheDocument();
      expect(screen.getByText('12.5MB')).toBeInTheDocument();

      // Check percentiles
      expect(screen.getByText('(85%)')).toBeInTheDocument();
      expect(screen.getByText('(78%)')).toBeInTheDocument();
    });

    it('should highlight accepted submissions with background color', async () => {
      render(<SubmissionHistory problemId="prob-1" userId="user-1" />);

      await waitFor(() => {
        expect(screen.getByText('Accepted')).toBeInTheDocument();
      });

      const acceptedSubmission = screen.getByText('Accepted').closest('button');
      expect(acceptedSubmission).toHaveClass('bg-success/5');
    });

    it('should mark best accepted submission with badge', async () => {
      render(<SubmissionHistory problemId="prob-1" userId="user-1" />);

      await waitFor(() => {
        expect(screen.getByText('Best')).toBeInTheDocument();
      });

      // Only one "Best" badge should exist
      const bestBadges = screen.getAllByText('Best');
      expect(bestBadges).toHaveLength(1);
    });

    it('should display relative timestamps', async () => {
      render(<SubmissionHistory problemId="prob-1" userId="user-1" />);

      await waitFor(() => {
        expect(screen.getByText('4 total')).toBeInTheDocument();
      });

      // Check for relative time format (use getAllByText since there are multiple timestamps)
      const timestamps = screen.getAllByText(/ago/);
      expect(timestamps.length).toBeGreaterThan(0);
    });

    it('should display appropriate status icons', async () => {
      const { container } = render(<SubmissionHistory problemId="prob-1" userId="user-1" />);

      await waitFor(() => {
        expect(screen.getByText('4 total')).toBeInTheDocument();
      });

      // Check for various status icons (by checking SVG elements)
      const icons = container.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThan(0);
    });

    it('should display loading state while fetching', () => {
      (global.fetch as any).mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 1000))
      );

      render(<SubmissionHistory problemId="prob-1" userId="user-1" />);

      expect(screen.getByText('Loading submissions...')).toBeInTheDocument();
    });

    it('should display empty state when no submissions exist', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ submissions: [] }),
      });

      render(<SubmissionHistory problemId="prob-1" userId="user-1" />);

      await waitFor(() => {
        expect(screen.getByText('No submissions yet')).toBeInTheDocument();
      });
    });

    it('should display error message when fetch fails', async () => {
      (global.fetch as any).mockRejectedValue(new Error('Network error'));

      render(<SubmissionHistory problemId="prob-1" userId="user-1" />);

      await waitFor(() => {
        expect(screen.getByText(/Error: Network error/i)).toBeInTheDocument();
      });
    });
  });

  describe('Status Filtering', () => {
    it('should filter submissions by status', async () => {
      render(<SubmissionHistory problemId="prob-1" userId="user-1" />);

      await waitFor(() => {
        expect(screen.getByText('4 total')).toBeInTheDocument();
      });

      // Open status filter dropdown
      const filterSelect = screen.getByRole('combobox');
      await userEvent.click(filterSelect);

      // Wait for dropdown to open and find "Accepted" option in the dropdown menu
      await waitFor(() => {
        const options = screen.getAllByText('Accepted');
        // Find the one that's in the dropdown (not in the submission list)
        const dropdownOption = options.find(el => 
          el.closest('[role="option"]') !== null
        );
        expect(dropdownOption).toBeDefined();
      });

      // Select "Accepted" filter from dropdown
      const acceptedOptions = screen.getAllByText('Accepted');
      const dropdownOption = acceptedOptions.find(el => 
        el.closest('[role="option"]') !== null
      );
      if (dropdownOption) {
        await userEvent.click(dropdownOption);
      }

      // Verify API was called with status filter
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('status=Accepted')
        );
      });
    });

    it('should display filtered empty state message', async () => {
      // Start with empty submissions
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ submissions: [] }),
      });

      render(<SubmissionHistory problemId="prob-1" userId="user-1" />);

      await waitFor(() => {
        expect(screen.getByText('No submissions yet')).toBeInTheDocument();
      });

      // Change filter - this will trigger a new fetch
      const filterSelect = screen.getByRole('combobox');
      await userEvent.click(filterSelect);
      
      // Wait for dropdown and select Accepted
      await waitFor(() => {
        expect(screen.getByRole('option', { name: /accepted/i })).toBeInTheDocument();
      });
      
      await userEvent.click(screen.getByRole('option', { name: /accepted/i }));

      await waitFor(() => {
        expect(screen.getByText('No Accepted submissions')).toBeInTheDocument();
      });
    });

    it('should fetch all submissions when filter is set to "all"', async () => {
      render(<SubmissionHistory problemId="prob-1" userId="user-1" />);

      await waitFor(() => {
        expect(screen.getByText('4 total')).toBeInTheDocument();
      });

      // Verify initial fetch doesn't include status parameter
      expect(global.fetch).toHaveBeenCalledWith(
        expect.not.stringContaining('status=')
      );
    });

    it('should support all status filter options', async () => {
      render(<SubmissionHistory problemId="prob-1" userId="user-1" />);

      await waitFor(() => {
        expect(screen.getByText('4 total')).toBeInTheDocument();
      });

      const filterSelect = screen.getByRole('combobox');
      await userEvent.click(filterSelect);

      // Check all filter options exist (use role="option" to find dropdown items)
      await waitFor(() => {
        expect(screen.getByRole('option', { name: /all submissions/i })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: /^accepted$/i })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: /wrong answer/i })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: /time limit exceeded/i })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: /memory limit exceeded/i })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: /runtime error/i })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: /compilation error/i })).toBeInTheDocument();
      });
    });
  });

  describe('Submission Selection', () => {
    it('should call onSubmissionSelect when submission is clicked', async () => {
      const onSubmissionSelect = vi.fn();
      render(
        <SubmissionHistory
          problemId="prob-1"
          userId="user-1"
          onSubmissionSelect={onSubmissionSelect}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('4 total')).toBeInTheDocument();
      });

      // Click on first submission - find by the status badge
      const acceptedBadges = screen.getAllByText('Accepted');
      const firstSubmission = acceptedBadges[0].closest('button');
      await userEvent.click(firstSubmission!);

      expect(onSubmissionSelect).toHaveBeenCalledWith('sub-1');
    });

    it('should highlight selected submission', async () => {
      const onSubmissionSelect = vi.fn();
      render(
        <SubmissionHistory
          problemId="prob-1"
          userId="user-1"
          onSubmissionSelect={onSubmissionSelect}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('4 total')).toBeInTheDocument();
      });

      // Click on first submission
      const acceptedBadges = screen.getAllByText('Accepted');
      const firstSubmission = acceptedBadges[0].closest('button');
      await userEvent.click(firstSubmission!);

      // Check that it's highlighted
      expect(firstSubmission).toHaveClass('bg-muted');
    });

    it('should allow selecting different submissions', async () => {
      const onSubmissionSelect = vi.fn();
      render(
        <SubmissionHistory
          problemId="prob-1"
          userId="user-1"
          onSubmissionSelect={onSubmissionSelect}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('4 total')).toBeInTheDocument();
      });

      // Click first submission
      const acceptedBadge = screen.getAllByText('Accepted')[0];
      const firstSubmission = acceptedBadge.closest('button');
      await userEvent.click(firstSubmission!);
      expect(onSubmissionSelect).toHaveBeenCalledWith('sub-1');

      // Click second submission
      const wrongAnswerBadge = screen.getByText('Wrong Answer');
      const secondSubmission = wrongAnswerBadge.closest('button');
      await userEvent.click(secondSubmission!);
      expect(onSubmissionSelect).toHaveBeenCalledWith('sub-2');
    });

    it('should show chevron icon on all submissions', async () => {
      const { container } = render(<SubmissionHistory problemId="prob-1" userId="user-1" />);

      await waitFor(() => {
        expect(screen.getByText('4 total')).toBeInTheDocument();
      });

      // Check for chevron icons (should be one per submission)
      const chevrons = container.querySelectorAll('svg.lucide-chevron-right');
      expect(chevrons.length).toBe(4);
    });
  });

  describe('API Integration', () => {
    it('should fetch submissions with correct API endpoint', async () => {
      render(<SubmissionHistory problemId="prob-123" userId="user-456" />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/submissions/user/user-456/problem/prob-123')
        );
      });
    });

    it('should not fetch if userId or problemId is missing', () => {
      render(<SubmissionHistory problemId="" userId="" />);

      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should refetch when filter changes', async () => {
      render(<SubmissionHistory problemId="prob-1" userId="user-1" />);

      await waitFor(() => {
        expect(screen.getByText('4 total')).toBeInTheDocument();
      });

      const initialCallCount = (global.fetch as any).mock.calls.length;

      // Change filter
      const filterSelect = screen.getByRole('combobox');
      await userEvent.click(filterSelect);
      
      // Wait for dropdown and select option
      await waitFor(() => {
        expect(screen.getByRole('option', { name: /^accepted$/i })).toBeInTheDocument();
      });
      
      await userEvent.click(screen.getByRole('option', { name: /^accepted$/i }));

      await waitFor(() => {
        expect((global.fetch as any).mock.calls.length).toBeGreaterThan(initialCallCount);
      });
    });

    it('should handle API errors gracefully', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: false,
        status: 500,
      });

      render(<SubmissionHistory problemId="prob-1" userId="user-1" />);

      await waitFor(() => {
        expect(screen.getByText(/Error: Failed to fetch submission history/i)).toBeInTheDocument();
      });
    });
  });
});
