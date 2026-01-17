# Coding Practice Components

## ProblemBrowser Component

A React component for browsing, filtering, and selecting coding problems.

### Features

- **Problem List Display**: Shows all available coding problems with title, difficulty, acceptance rate, and tags
- **Difficulty Filter**: Filter problems by Easy, Medium, or Hard difficulty levels
- **Tag Filter**: Multi-select filter for problem tags (Array, String, Hash Map, etc.)
- **Search**: Debounced search input for finding problems by title
- **Sort Options**: Sort problems by difficulty, acceptance rate, or title
- **Visual Indicators**: Shows solved status with checkmarks
- **Responsive Design**: Works on desktop and mobile devices

### Usage

```tsx
import { ProblemBrowser } from '@/components/coding/ProblemBrowser';

function MyPage() {
  const [selectedProblemId, setSelectedProblemId] = useState<string | number>();

  return (
    <ProblemBrowser
      onProblemSelect={setSelectedProblemId}
      selectedProblemId={selectedProblemId}
    />
  );
}
```

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `onProblemSelect` | `(problemId: string \| number) => void` | No | Callback when a problem is selected |
| `selectedProblemId` | `string \| number` | No | ID of the currently selected problem |

### API Integration

The component expects a backend API endpoint at `/api/problems` that accepts the following query parameters:

- `difficulty`: Filter by difficulty level (Easy, Medium, Hard)
- `tags`: Comma-separated list of tags to filter by
- `search`: Search query for problem titles
- `sortBy`: Sort criterion (difficulty, acceptance, title)

**Example API Response:**
```json
{
  "problems": [
    {
      "id": 1,
      "title": "Two Sum",
      "difficulty": "Easy",
      "tags": ["Array", "Hash Map"],
      "companies": ["Google", "Amazon"],
      "acceptance": 48.2,
      "solved": true
    }
  ]
}
```

### Testing

Unit tests are provided in `ProblemBrowser.test.tsx`. To run tests, you need to set up the testing environment:

#### 1. Install Testing Dependencies

```bash
cd Frontend
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom @vitejs/plugin-react
```

#### 2. Create Vitest Configuration

Create `Frontend/vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

#### 3. Create Test Setup File

Create `Frontend/src/test/setup.ts`:

```typescript
import '@testing-library/jest-dom';
```

#### 4. Add Test Script to package.json

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

#### 5. Run Tests

```bash
npm test
```

### Integration with CodingPracticePage

To integrate the ProblemBrowser into the existing CodingPracticePage:

```tsx
import { ProblemBrowser } from '@/components/coding/ProblemBrowser';

// Replace the existing problem list sidebar with:
<div className="lg:col-span-3">
  <ProblemBrowser
    onProblemSelect={(id) => {
      // Fetch and set the selected problem
      const problem = problems.find(p => p.id === id);
      if (problem) setSelectedProblem(problem);
    }}
    selectedProblemId={selectedProblem?.id}
  />
</div>
```

### Styling

The component uses Tailwind CSS and shadcn/ui components. Ensure these are properly configured in your project.

### Error Handling

The component handles the following error scenarios:
- Network failures
- API errors (non-200 responses)
- Empty result sets
- Missing or incomplete data

### Performance Considerations

- **Debounced Search**: Search input is debounced by 300ms to reduce API calls
- **Memoized Tags**: Available tags are computed only when problems change
- **Optimized Rendering**: Uses React best practices for efficient re-renders

### Accessibility

- Keyboard navigation support
- ARIA labels for screen readers
- Focus management
- Semantic HTML structure


---

## SubmissionHistory Component

A React component for displaying a user's submission history for a specific problem.

### Features

- **Submission List**: Displays all submissions with status, runtime, memory, and timestamp
- **Status Filtering**: Filter submissions by status (Accepted, Wrong Answer, etc.)
- **Performance Metrics**: Shows runtime and memory percentiles for accepted submissions
- **Best Solution Badge**: Highlights the best accepted submission
- **Clickable Rows**: Select submissions to view detailed information
- **Relative Timestamps**: Shows submission times in human-readable format
- **Visual Status Indicators**: Color-coded icons for different submission statuses

### Usage

```tsx
import { SubmissionHistory } from '@/components/coding/SubmissionHistory';

function MyPage() {
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);

  return (
    <SubmissionHistory
      problemId="prob-123"
      userId="user-456"
      onSubmissionSelect={setSelectedSubmissionId}
    />
  );
}
```

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `problemId` | `string \| number` | Yes | ID of the problem to fetch submissions for |
| `userId` | `string \| number` | Yes | ID of the user whose submissions to display |
| `onSubmissionSelect` | `(submissionId: string) => void` | No | Callback when a submission is clicked |

### API Integration

The component expects a backend API endpoint at `/api/submissions/user/:userId/problem/:problemId` that accepts the following query parameters:

- `status`: Filter by submission status (optional)

**Example API Response:**
```json
{
  "success": true,
  "count": 5,
  "submissions": [
    {
      "id": "sub-1",
      "status": "Accepted",
      "runtime": 45,
      "memory": 12.5,
      "runtimePercentile": 85.3,
      "memoryPercentile": 78.2,
      "testsPassed": 10,
      "totalTests": 10,
      "language": "python",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### Submission Statuses

The component supports the following submission statuses:
- `Accepted` - All test cases passed
- `Wrong Answer` - One or more test cases failed
- `Time Limit Exceeded` - Code execution exceeded time limit
- `Memory Limit Exceeded` - Code execution exceeded memory limit
- `Runtime Error` - Code crashed during execution
- `Compilation Error` - Code failed to compile

---

## SubmissionDetail Component

A modal component for displaying detailed information about a specific submission.

### Features

- **Code Display**: Shows submitted code with syntax highlighting
- **Test Results**: Displays all test case results with inputs and outputs
- **Performance Metrics**: Shows runtime and memory percentiles for accepted submissions
- **Error Details**: Displays error messages and stack traces for failed submissions
- **Tabbed Interface**: Separate tabs for code and test results
- **Read-Only Editor**: Uses Monaco Editor for code display
- **Responsive Modal**: Works on desktop and mobile devices

### Usage

```tsx
import { SubmissionDetail } from '@/components/coding/SubmissionDetail';

function MyPage() {
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <SubmissionDetail
      submissionId={submissionId}
      open={isOpen}
      onClose={() => setIsOpen(false)}
    />
  );
}
```

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `submissionId` | `string \| null` | Yes | ID of the submission to display |
| `open` | `boolean` | Yes | Whether the modal is open |
| `onClose` | `() => void` | Yes | Callback when the modal is closed |

### API Integration

The component expects a backend API endpoint at `/api/submissions/:id` that returns detailed submission information.

**Example API Response:**
```json
{
  "success": true,
  "submission": {
    "id": "sub-1",
    "userId": "user-1",
    "problemId": "prob-1",
    "code": "def solution(nums):\n    return sum(nums)",
    "language": "python",
    "status": "Accepted",
    "runtime": 45,
    "memory": 12.5,
    "runtimePercentile": 85.3,
    "memoryPercentile": 78.2,
    "testsPassed": 10,
    "totalTests": 10,
    "testResults": [
      {
        "testCaseId": "test-1",
        "passed": true,
        "input": "[1, 2, 3]",
        "expectedOutput": "6",
        "actualOutput": "6",
        "runtime": 42,
        "memory": 12.0
      }
    ],
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

## Complete Integration Example

Here's how to use SubmissionHistory and SubmissionDetail together:

```tsx
import { useState } from 'react';
import { SubmissionHistory } from '@/components/coding/SubmissionHistory';
import { SubmissionDetail } from '@/components/coding/SubmissionDetail';

function CodingPracticePage() {
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const handleSubmissionSelect = (submissionId: string) => {
    setSelectedSubmissionId(submissionId);
    setIsDetailOpen(true);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
      {/* Problem Browser */}
      <div className="lg:col-span-1">
        <ProblemBrowser onProblemSelect={handleProblemSelect} />
      </div>

      {/* Problem Detail and Code Editor */}
      <div className="lg:col-span-2">
        <ProblemDetail problem={selectedProblem} />
        <CodeEditor problemId={selectedProblem?.id} userId={userId} />
      </div>

      {/* Submission History */}
      <div className="lg:col-span-1">
        <SubmissionHistory
          problemId={selectedProblem?.id}
          userId={userId}
          onSubmissionSelect={handleSubmissionSelect}
        />
      </div>

      {/* Submission Detail Modal */}
      <SubmissionDetail
        submissionId={selectedSubmissionId}
        open={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      />
    </div>
  );
}
```

### Dependencies

All components require the following dependencies:
- `@monaco-editor/react` - For code editor
- `lucide-react` - For icons
- `date-fns` - For date formatting
- `shadcn/ui` components - For UI elements

Install with:
```bash
npm install @monaco-editor/react lucide-react date-fns
```

### Testing

Unit tests are provided for all components. Run tests with:
```bash
npm test
```

Note: Some tests may have environment-related warnings (ResizeObserver, hasPointerCapture) due to jsdom limitations. These do not affect the actual functionality of the components.
