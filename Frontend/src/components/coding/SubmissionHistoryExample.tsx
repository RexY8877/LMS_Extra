/**
 * Example integration of SubmissionHistory and SubmissionDetail components
 * 
 * This file demonstrates how to use the SubmissionHistory component
 * together with the SubmissionDetail modal to create a complete
 * submission viewing experience.
 */

import { useState } from 'react';
import { SubmissionHistory } from './SubmissionHistory';
import { SubmissionDetail } from './SubmissionDetail';

interface SubmissionHistoryExampleProps {
  problemId: string | number;
  userId: string | number;
}

export const SubmissionHistoryExample = ({ problemId, userId }: SubmissionHistoryExampleProps) => {
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const handleSubmissionSelect = (submissionId: string) => {
    setSelectedSubmissionId(submissionId);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
  };

  return (
    <>
      <SubmissionHistory
        problemId={problemId}
        userId={userId}
        onSubmissionSelect={handleSubmissionSelect}
      />

      <SubmissionDetail
        submissionId={selectedSubmissionId}
        open={isDetailOpen}
        onClose={handleCloseDetail}
      />
    </>
  );
};
