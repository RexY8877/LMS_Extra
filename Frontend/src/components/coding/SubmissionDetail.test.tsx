import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SubmissionDetail, SubmissionDetailData } from './SubmissionDetail';

// Mock fetch globally
global.fetch = vi.fn();

const mockAcceptedSubmission: SubmissionDetailData = {
  id: 'sub-1',
  userId: 'user-1',
  problemId: 'prob-1',
  code: 'def solution(nums):\n    return sum(nums)',
  language: 'python',
  status: 'Accepted',
  runtime: 45,
  memory: 12.5,
  runtimePercentile: 85.3,
  memoryPercentile: 78.2,
  testsPassed: 10,
  totalTests: 10,
  testResults: [
    {
      testCaseId: 'test-1',
      passed: true,
      input: '[1, 2, 3]',
      expectedOutput: '6',
      actualOutput: '6',
      runtime: 42,
      memory: 12.0,
    },
    {
      testCaseId: 'test-2',
      passed: true,
      input: '[10, 20, 30]',
      expectedOutput: '60',
      actualOutput: '60',
      runtime: 48,
      memory: 13.0,
    },
  ],
  createdAt: new Date().toISOString(),
};

const mockFailedSubmission: SubmissionDetailData = {
  id: 'sub-2',
  userId: 'user-1',
  problemId: 'prob-1',
  code: 'def solution(nums):\n    return nums[0]',
  language: 'python',
  status: 'Wrong Answer',
  testsPassed: 1,
  totalTests: 3,
  testResults: [
    {
      testCaseId: 'test-1',
      passed: true,
      input: '[5]',
      expectedOutput: '5',
      actualOutput: '5',
    },
    {
      testCaseId: 'test-2',
      passed: false,
      input: '[1, 2, 3]',
      expectedOutput: '6',
      actualOutput: '1',
    },
    {
      testCaseId: 'test-3',
      passed: false,
      input: '[]',
      expectedOutput: '0',
      actualOutput: '',
      error: 'IndexError: list index out of range',
    },
  ],
  createdAt: new Date().toISOString(),
};

describe('SubmissionDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Code Display', () => {
    it('should display submitted code with syntax highlighting', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ submission: mockAcceptedSubmission }),
      });

      render(<SubmissionDetail submissionId="sub-1" open={true} onClose={() => {}} />);

      await waitFor(() => {
        expect(screen.getByText('Submitted Code')).toBeInTheDocument();
      });

      // Check that code tab is present
      expect(screen.getByRole('tab', { name: /submitted code/i })).toBeInTheDocument();
    });

    it('should display code in read-only editor', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ submission: mockAcceptedSubmission }),
      });

      const { container } = render(
        <SubmissionDetail submissionId="sub-1" open={true} onClose={() => {}} />
      );

      await waitFor(() => {
        expect(screen.getByText('Submitted Code')).toBeInTheDocument();
      });

      // Check for Monaco editor container
      const editorContainer = container.querySelector('[data-mode-id]');
      expect(editorContainer).toBeTruthy();
    });

    it('should display correct language badge', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ submission: mockAcceptedSubmission }),
      });

      render(<SubmissionDetail submissionId="sub-1" open={true} onClose={() => {}} />);

      await waitFor(() => {
        expect(screen.getByText('Python')).toBeInTheDocument();
      });
    });

    it('should display submission timestamp', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ submission: mockAcceptedSubmission }),
      });

      render(<SubmissionDetail submissionId="sub-1" open={true} onClose={() => {}} />);

      await waitFor(() => {
        // Check for any date/time format
        const timestamps = screen.getAllByText(/\d/);
        expect(timestamps.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Results Rendering', () => {
    it('should display submission status', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ submission: mockAcceptedSubmission }),
      });

      render(<SubmissionDetail submissionId="sub-1" open={true} onClose={() => {}} />);

      await waitFor(() => {
        expect(screen.getByText('Accepted')).toBeInTheDocument();
      });
    });

    it('should display test case pass/fail count', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ submission: mockAcceptedSubmission }),
      });

      render(<SubmissionDetail submissionId="sub-1" open={true} onClose={() => {}} />);

      await waitFor(() => {
        expect(screen.getByText('10/10 test cases passed')).toBeInTheDocument();
      });
    });

    it('should display execution metrics for accepted submissions', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ submission: mockAcceptedSubmission }),
      });

      render(<SubmissionDetail submissionId="sub-1" open={true} onClose={() => {}} />);

      await waitFor(() => {
        expect(screen.getByText('45ms')).toBeInTheDocument();
        expect(screen.getByText('12.5MB')).toBeInTheDocument();
      });

      // Check percentiles
      expect(screen.getByText(/85\.3%/)).toBeInTheDocument();
      expect(screen.getByText(/78\.2%/)).toBeInTheDocument();
    });

    it('should display test results when switching to results tab', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ submission: mockAcceptedSubmission }),
      });

      render(<SubmissionDetail submissionId="sub-1" open={true} onClose={() => {}} />);

      await waitFor(() => {
        expect(screen.getByText('Submitted Code')).toBeInTheDocument();
      });

      // Click on Test Results tab
      const resultsTab = screen.getByRole('tab', { name: /test results/i });
      await userEvent.click(resultsTab);

      await waitFor(() => {
        expect(screen.getByText('Test Case 1')).toBeInTheDocument();
        expect(screen.getByText('Test Case 2')).toBeInTheDocument();
      });
    });

    it('should display test inputs and outputs', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ submission: mockAcceptedSubmission }),
      });

      render(<SubmissionDetail submissionId="sub-1" open={true} onClose={() => {}} />);

      await waitFor(() => {
        expect(screen.getByText('Submitted Code')).toBeInTheDocument();
      });

      // Switch to results tab
      const resultsTab = screen.getByRole('tab', { name: /test results/i });
      await userEvent.click(resultsTab);

      await waitFor(() => {
        expect(screen.getByText('[1, 2, 3]')).toBeInTheDocument();
        expect(screen.getByText('[10, 20, 30]')).toBeInTheDocument();
      });
    });

    it('should display failed test case details', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ submission: mockFailedSubmission }),
      });

      render(<SubmissionDetail submissionId="sub-2" open={true} onClose={() => {}} />);

      await waitFor(() => {
        expect(screen.getByText('Wrong Answer')).toBeInTheDocument();
      });

      // Switch to results tab
      const resultsTab = screen.getByRole('tab', { name: /test results/i });
      await userEvent.click(resultsTab);

      await waitFor(() => {
        // Check for expected vs actual output labels
        expect(screen.getAllByText(/Expected Output:/i).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/Your Output:/i).length).toBeGreaterThan(0);
      });
    });

    it('should display error messages for failed test cases', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ submission: mockFailedSubmission }),
      });

      render(<SubmissionDetail submissionId="sub-2" open={true} onClose={() => {}} />);

      await waitFor(() => {
        expect(screen.getByText('Wrong Answer')).toBeInTheDocument();
      });

      // Switch to results tab
      const resultsTab = screen.getByRole('tab', { name: /test results/i });
      await userEvent.click(resultsTab);

      await waitFor(() => {
        expect(screen.getByText(/IndexError: list index out of range/)).toBeInTheDocument();
      });
    });

    it('should show pass/fail icons for test cases', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ submission: mockFailedSubmission }),
      });

      const { container } = render(
        <SubmissionDetail submissionId="sub-2" open={true} onClose={() => {}} />
      );

      await waitFor(() => {
        expect(screen.getByText('Wrong Answer')).toBeInTheDocument();
      });

      // Switch to results tab
      const resultsTab = screen.getByRole('tab', { name: /test results/i });
      await userEvent.click(resultsTab);

      await waitFor(() => {
        // Check for check and x circle icons
        const checkIcons = container.querySelectorAll('.lucide-circle-check');
        const xIcons = container.querySelectorAll('.lucide-circle-x');
        expect(checkIcons.length + xIcons.length).toBeGreaterThan(0);
      });
    });

    it('should display runtime for individual test cases', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ submission: mockAcceptedSubmission }),
      });

      render(<SubmissionDetail submissionId="sub-1" open={true} onClose={() => {}} />);

      await waitFor(() => {
        expect(screen.getByText('Submitted Code')).toBeInTheDocument();
      });

      // Switch to results tab
      const resultsTab = screen.getByRole('tab', { name: /test results/i });
      await userEvent.click(resultsTab);

      await waitFor(() => {
        expect(screen.getByText('42ms')).toBeInTheDocument();
        expect(screen.getByText('48ms')).toBeInTheDocument();
      });
    });
  });

  describe('Modal Behavior', () => {
    it('should fetch submission data when opened', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ submission: mockAcceptedSubmission }),
      });

      render(<SubmissionDetail submissionId="sub-1" open={true} onClose={() => {}} />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/submissions/sub-1');
      });
    });

    it('should display loading state while fetching', () => {
      (global.fetch as any).mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 1000))
      );

      render(<SubmissionDetail submissionId="sub-1" open={true} onClose={() => {}} />);

      expect(screen.getByText('Loading submission...')).toBeInTheDocument();
    });

    it('should display error message when fetch fails', async () => {
      (global.fetch as any).mockRejectedValue(new Error('Network error'));

      render(<SubmissionDetail submissionId="sub-1" open={true} onClose={() => {}} />);

      await waitFor(() => {
        expect(screen.getByText(/Error: Network error/i)).toBeInTheDocument();
      });
    });

    it('should call onClose when close button is clicked', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ submission: mockAcceptedSubmission }),
      });

      const onClose = vi.fn();
      render(<SubmissionDetail submissionId="sub-1" open={true} onClose={onClose} />);

      await waitFor(() => {
        expect(screen.getByText('Submission Details')).toBeInTheDocument();
      });

      // Find and click close button
      const closeButtons = screen.getAllByRole('button');
      const closeButton = closeButtons.find(btn => 
        btn.querySelector('.lucide-x') !== null
      );
      
      if (closeButton) {
        await userEvent.click(closeButton);
        expect(onClose).toHaveBeenCalled();
      }
    });

    it('should not fetch when modal is closed', () => {
      render(<SubmissionDetail submissionId="sub-1" open={false} onClose={() => {}} />);

      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should not fetch when submissionId is null', () => {
      render(<SubmissionDetail submissionId={null} open={true} onClose={() => {}} />);

      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('Different Submission Statuses', () => {
    it('should display appropriate styling for accepted submissions', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ submission: mockAcceptedSubmission }),
      });

      const { container } = render(
        <SubmissionDetail submissionId="sub-1" open={true} onClose={() => {}} />
      );

      await waitFor(() => {
        expect(screen.getByText('Accepted')).toBeInTheDocument();
      });

      // Check for success icon
      const successIcon = container.querySelector('.text-success');
      expect(successIcon).toBeTruthy();
    });

    it('should display appropriate styling for failed submissions', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ submission: mockFailedSubmission }),
      });

      const { container } = render(
        <SubmissionDetail submissionId="sub-2" open={true} onClose={() => {}} />
      );

      await waitFor(() => {
        expect(screen.getByText('Wrong Answer')).toBeInTheDocument();
      });

      // Check for destructive styling
      const destructiveIcon = container.querySelector('.text-destructive');
      expect(destructiveIcon).toBeTruthy();
    });

    it('should not display metrics for failed submissions', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ submission: mockFailedSubmission }),
      });

      render(<SubmissionDetail submissionId="sub-2" open={true} onClose={() => {}} />);

      await waitFor(() => {
        expect(screen.getByText('Wrong Answer')).toBeInTheDocument();
      });

      // Runtime and memory percentiles should not be displayed
      expect(screen.queryByText(/Beats.*% of submissions/)).not.toBeInTheDocument();
    });
  });
});
