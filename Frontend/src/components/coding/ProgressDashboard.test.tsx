import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ProgressDashboard } from './ProgressDashboard';

global.fetch = vi.fn();

describe('ProgressDashboard', () => {
  const mockUserId = 'user123';
  const mockStats = {
    totalSolved: 42,
    easySolved: 20,
    mediumSolved: 15,
    hardSolved: 7,
    totalSubmissions: 100,
    acceptedSubmissions: 42,
    acceptanceRate: 42.0,
    solvedByTopic: { 'Arrays': 15, 'Strings': 10 },
    dailyActivity: { '2024-01-01': 2 },
    streak: 5,
    lastSolvedAt: '2024-01-05T10:00:00Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display total solved problems', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ stats: mockStats }),
    });
    render(<ProgressDashboard userId={mockUserId} />);
    await waitFor(() => {
      expect(screen.getByText('Total Solved')).toBeInTheDocument();
      expect(screen.getByText('Acceptance Rate')).toBeInTheDocument();
    });
  });

  it('should render activity heatmap', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ stats: mockStats }),
    });
    render(<ProgressDashboard userId={mockUserId} />);
    await waitFor(() => {
      expect(screen.getByText('Daily Activity')).toBeInTheDocument();
      expect(screen.getByText('Less')).toBeInTheDocument();
      expect(screen.getByText('More')).toBeInTheDocument();
    });
  });
});
