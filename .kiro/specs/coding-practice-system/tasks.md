# Implementation Plan: Coding Practice System

## Overview

This implementation plan breaks down the Coding Practice System into discrete, incremental tasks. Each task builds on previous work, with testing integrated throughout. The plan follows a bottom-up approach: database models → API endpoints → execution engine → frontend components → integration.

## Tasks

- [x] 1. Set up database models and migrations
  - Extend CodingProblem model with description, constraints, examples, hints, timeLimit, memoryLimit fields
  - Create TestCase model with problemId, input, expectedOutput, isExample, weight fields
  - Create Submission model with userId, problemId, code, language, status, runtime, memory, percentiles, testsPassed, totalTests fields
  - Create SolutionTemplate model with problemId, language, template, functionSignature fields
  - Create StudentProgress model with userId, counters by difficulty, solvedByTopic map, dailyActivity map, streak fields
  - Run migrations to create/update tables
  - _Requirements: 1.1, 2.1, 5.5, 8.1, 8.2, 8.4, 8.5, 11.1_

- [x] 1.1 Write property test for database model validation
  - **Property 5: Problem details contain all required fields**
  - **Validates: Requirements 2.1, 2.4, 2.5**

- [x] 2. Implement problem management API endpoints
  - [x] 2.1 Create GET /api/problems endpoint with filtering and sorting
    - Implement query parameter parsing for difficulty, tags, search, sortBy
    - Add database queries with WHERE clauses for filters
    - Implement sorting logic for difficulty, acceptance, title
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [x] 2.2 Write property tests for problem filtering
    - **Property 1: Problem filtering returns only matching problems**
    - **Validates: Requirements 1.2**
    - **Property 2: Tag filtering returns problems with at least one matching tag**
    - **Validates: Requirements 1.3**
    - **Property 3: Search returns problems with matching titles**
    - **Validates: Requirements 1.4**

  - [x] 2.3 Write property test for problem sorting
    - **Property 4: Problem sorting maintains correct order**
    - **Validates: Requirements 1.5**

  - [x] 2.4 Create GET /api/problems/:id endpoint
    - Fetch problem with all details including examples and constraints
    - Include test cases marked as examples
    - _Requirements: 2.1, 2.2, 2.4, 2.5_

  - [x] 2.5 Write property test for problem examples
    - **Property 6: All problem examples are included in response**
    - **Validates: Requirements 2.2**

  - [x] 2.6 Create GET /api/problems/:id/template endpoint
    - Fetch or generate solution template for specified language
    - Include function signature and necessary imports
    - _Requirements: 3.2, 11.1, 11.3, 11.5_

  - [x] 2.7 Write property tests for template generation
    - **Property 7: Language templates are generated correctly**
    - **Validates: Requirements 3.2**
    - **Property 31: Templates include function signatures**
    - **Validates: Requirements 11.1**
    - **Property 34: Templates include necessary imports**
    - **Validates: Requirements 11.5**

- [x] 3. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Implement output comparison utility
  - [x] 4.1 Create compareOutputs function
    - Implement whitespace normalization (trim, collapse spaces)
    - Implement line ending normalization (CRLF to LF)
    - Return boolean indicating equality
    - _Requirements: 6.2_

  - [x] 4.2 Write property test for output comparison
    - **Property 18: Output comparison normalizes whitespace**
    - **Validates: Requirements 6.2**

- [x] 5. Implement Docker-based execution engine
  - [x] 5.1 Create Docker container configurations
    - Write Dockerfile for Python runtime (python:3.11-alpine)
    - Write Dockerfile for JavaScript runtime (node:18-alpine)
    - Write Dockerfile for Java runtime (openjdk:17-alpine)
    - Configure non-root user, resource limits, and security restrictions
    - _Requirements: 3.5, 9.1, 9.2, 9.3, 9.4_

  - [x] 5.2 Create code execution service
    - Implement function to create Docker container with code and test cases
    - Set CPU limit (1 core), memory limit (256MB), time limit (problem-specific)
    - Execute code and capture stdout, stderr, exit code
    - Implement timeout mechanism to kill long-running containers
    - Clean up containers after execution
    - _Requirements: 4.1, 4.4, 4.5, 9.5_

  - [x] 5.3 Write property tests for execution limits
    - **Property 11: Time limit exceeded terminates execution**
    - **Validates: Requirements 4.4**
    - **Property 12: Memory limit exceeded terminates execution**
    - **Validates: Requirements 4.5**
    - **Property 28: Resource limit violations terminate execution**
    - **Validates: Requirements 9.5**

  - [x] 5.4 Implement test case runner
    - Load test cases for problem
    - For "run" requests, filter to example test cases only
    - For "submit" requests, use all test cases
    - Execute code against each test case sequentially
    - Stop execution on first failure for submissions
    - Compare actual output with expected output using compareOutputs
    - Capture runtime and memory usage per test case
    - _Requirements: 4.1, 4.2, 5.1, 5.3, 6.1, 6.3_

  - [x] 5.5 Write property tests for test execution
    - **Property 8: Run code executes only example test cases**
    - **Validates: Requirements 4.1**
    - **Property 13: Submissions execute all test cases**
    - **Validates: Requirements 5.1**
    - **Property 17: Test execution stops at first failure**
    - **Validates: Requirements 6.1**

  - [x] 5.6 Implement error handling for execution
    - Parse compilation errors and extract line numbers
    - Capture runtime errors with stack traces
    - Format error messages for display
    - _Requirements: 4.3, 12.3, 12.4_

  - [x] 5.7 Write property tests for error handling
    - **Property 10: Execution errors include diagnostic information**
    - **Validates: Requirements 4.3**
    - **Property 36: Syntax errors include location information**
    - **Validates: Requirements 12.3**
    - **Property 37: Runtime errors include stack traces**
    - **Validates: Requirements 12.4**

- [x] 6. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Implement execution API endpoints
  - [x] 7.1 Create POST /api/execute/run endpoint
    - Accept problemId, code, language in request body
    - Fetch example test cases for problem
    - Call execution service with code and test cases
    - Return results with actual/expected outputs
    - _Requirements: 4.1, 4.2, 12.2_

  - [x] 7.2 Write property tests for run endpoint
    - **Property 9: Execution results include required output fields**
    - **Validates: Requirements 4.2**
    - **Property 35: Execution completes within time bounds**
    - **Validates: Requirements 12.2**

  - [x] 7.2 Create POST /api/execute/submit endpoint
    - Accept problemId, code, language, userId in request body
    - Fetch all test cases for problem
    - Call execution service with code and test cases
    - Determine submission status based on results
    - Calculate runtime and memory percentiles
    - Save submission to database
    - Update student progress if accepted
    - Return submission results
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 10.2, 10.4_

  - [x] 7.3 Write property tests for submit endpoint
    - **Property 14: All passing test cases result in accepted status**
    - **Validates: Requirements 5.2**
    - **Property 15: Any failing test case results in wrong answer status**
    - **Validates: Requirements 5.3**
    - **Property 16: Accepted submissions are persisted with complete data**
    - **Validates: Requirements 5.5**
    - **Property 19: Failed test cases capture complete diagnostic data**
    - **Validates: Requirements 6.3**
    - **Property 38: Test failures provide comparison data**
    - **Validates: Requirements 12.5**

- [x] 8. Implement submission history API endpoints
  - [x] 8.1 Create GET /api/submissions/user/:userId/problem/:problemId endpoint
    - Fetch all submissions for user and problem
    - Order by timestamp descending
    - Support filtering by status
    - _Requirements: 7.1, 7.2, 7.5_
 
  - [x] 8.2 Write property tests for submission history
    - **Property 20: Submission history is ordered by timestamp**
    - **Validates: Requirements 7.1**
    - **Property 21: Submission records contain required metrics**
    - **Validates: Requirements 7.2**
    - **Property 23: Status filtering returns only matching submissions**
    - **Validates: Requirements 7.5**

  - [x] 8.3 Create GET /api/submissions/:id endpoint
    - Fetch submission details including code and test results
    - _Requirements: 7.3_

  - [x] 8.4 Write property test for submission details
    - **Property 22: Submission details include code and results**
    - **Validates: Requirements 7.3**

- [x] 9. Implement progress tracking system
  - [x] 9.1 Create progress update function
    - Check if problem was previously solved by user
    - Update total solved count and difficulty-specific count
    - Update topic-based progress for each problem tag
    - Update daily activity map for current date
    - Recalculate streak based on consecutive days
    - _Requirements: 8.1, 8.2, 8.4, 8.5_

  - [x] 9.2 Write property tests for progress tracking
    - **Property 24: Solving problems updates progress counters**
    - **Validates: Requirements 8.1, 8.2**
    - **Property 26: Topic-based progress tracks solved problems by tag**
    - **Validates: Requirements 8.4**
    - **Property 27: Daily activity records problems solved per day**
    - **Validates: Requirements 8.5**

  - [x] 9.3 Create GET /api/submissions/user/:userId/stats endpoint
    - Calculate acceptance rate (accepted / total submissions)
    - Aggregate problems solved by difficulty
    - Aggregate problems solved by topic
    - Return daily activity data
    - _Requirements: 8.3_

  - [x] 9.4 Write property test for progress statistics
    - **Property 25: Profile displays complete progress statistics**
    - **Validates: Requirements 8.3**

- [ ] 10. Implement performance metrics calculation
  - [x] 10.1 Create percentile calculation function
    - Fetch all accepted submissions for problem
    - Sort by runtime/memory
    - Calculate percentile for given submission
    - _Requirements: 10.2, 10.4_

  - [x] 10.2 Write property test for percentile calculation
    - **Property 29: Percentile rankings are calculated correctly**
    - **Validates: Requirements 10.2, 10.4**

  - [x] 10.3 Create GET /api/problems/:id/stats endpoint
    - Calculate average runtime across accepted submissions
    - Calculate average memory usage across accepted submissions
    - _Requirements: 10.5_

  - [x] 10.4 Write property test for problem statistics
    - **Property 30: Problem statistics aggregate accepted submissions**
    - **Validates: Requirements 10.5**

- [x] 11. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 12. Implement frontend ProblemBrowser component
  - [x] 12.1 Create ProblemBrowser component
    - Fetch problems from API on mount
    - Implement difficulty filter dropdown
    - Implement tag filter multi-select
    - Implement search input with debouncing
    - Implement sort dropdown
    - Display problems in table/card layout with title, difficulty, acceptance, tags
    - Handle loading and error states
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [x] 12.2 Write unit tests for ProblemBrowser
    - Test filter state management
    - Test API integration
    - Test error handling

- [x] 13. Implement frontend ProblemDetail component
  - [x] 13.1 Create ProblemDetail component
    - Fetch problem details from API
    - Display title with difficulty badge
    - Render description with markdown support
    - Display example test cases in formatted boxes
    - Create expandable sections for hints
    - Display company tags as badges
    - Display constraints list
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [x] 13.2 Write unit tests for ProblemDetail
    - Test problem data rendering
    - Test expandable hints functionality

- [x] 14. Implement frontend CodeEditor component
  - [x] 14.1 Create CodeEditor component using Monaco Editor or CodeMirror
    - Initialize editor with syntax highlighting
    - Implement language selector dropdown
    - Fetch and load solution template when language changes
    - Implement auto-indentation and bracket matching
    - Add "Run Code" and "Submit" buttons
    - Display loading states during execution
    - Store code in component state with language-specific caching
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 11.4_

  - [x] 14.2 Write property test for code preservation
    - **Property 33: Code is preserved across language switches**
    - **Validates: Requirements 11.4**

  - [x] 14.3 Implement code execution UI
    - Call /api/execute/run on "Run Code" click
    - Display test results with actual vs expected outputs
    - Show execution time and memory usage
    - Display errors with syntax highlighting
    - Show diff view for failed test cases
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 12.5_

  - [x] 14.4 Write unit tests for code execution UI
    - Test run code functionality
    - Test error display
    - Test result rendering

  - [x] 14.5 Implement code submission UI
    - Call /api/execute/submit on "Submit" click
    - Display submission status (Accepted, Wrong Answer, etc.)
    - Show runtime and memory percentiles
    - Display test results summary
    - Show success animation for accepted submissions
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 10.1, 10.2, 10.3, 10.4_

  - [x] 14.6 Write unit tests for submission UI
    - Test submit functionality
    - Test status display
    - Test percentile rendering

- [x] 15. Implement frontend SubmissionHistory component
  - [x] 15.1 Create SubmissionHistory component
    - Fetch submission history from API
    - Display submissions in table with status, runtime, memory, timestamp
    - Implement status filter dropdown
    - Highlight accepted submissions
    - Make rows clickable to view submission details
    - _Requirements: 7.1, 7.2, 7.4, 7.5_

  - [x] 15.2 Write unit tests for SubmissionHistory
    - Test submission list rendering
    - Test status filtering
    - Test submission selection

  - [x] 15.3 Create SubmissionDetail modal/page
    - Display submitted code with syntax highlighting
    - Show all test results
    - Display execution metrics
    - _Requirements: 7.3_

  - [x] 15.4 Write unit tests for SubmissionDetail
    - Test code display
    - Test results rendering

- [x] 16. Implement frontend ProgressDashboard component
  - [x] 16.1 Create ProgressDashboard component
    - Fetch user statistics from API
    - Display total problems solved with breakdown by difficulty
    - Show acceptance rate with visual indicator
    - Display topic-based progress as chart or list
    - Render calendar heatmap for daily activity
    - Show current streak
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

  - [x] 16.2 Write unit tests for ProgressDashboard
    - Test statistics rendering
    - Test chart/heatmap display

- [x] 17. Integrate coding practice into student dashboard
  - [x] 17.1 Update student dashboard navigation
    - Add "Coding Practice" link to sidebar
    - Update routing to include coding practice pages
    - _Requirements: 1.1_

  - [x] 17.2 Create main coding practice page layout
    - Combine ProblemBrowser and ProblemDetail in split view
    - Add CodeEditor below problem details
    - Include SubmissionHistory in collapsible panel
    - Implement responsive layout for mobile
    - _Requirements: 1.1, 2.1, 3.1, 7.1_

  - [x] 17.3 Write integration tests
    - Test navigation flow
    - Test component interactions
    - Test data flow between components

- [x] 18. Seed database with sample problems
  - [x] 18.1 Create seeder script for coding problems
    - Add 10-15 sample problems across difficulty levels
    - Include classic problems (Two Sum, Reverse String, etc.)
    - Add test cases for each problem (example and hidden)
    - Create solution templates for Python, JavaScript, Java
    - _Requirements: 1.1, 2.1, 3.2, 4.1, 5.1_

  - [x] 18.2 Update main seeder to include coding problems
    - Call coding problem seeder in main seeder script
    - _Requirements: 1.1_

- [ ] 19. Final checkpoint - End-to-end testing
  - Ensure all tests pass, ask the user if questions arise.
  - Manually test complete user flow: browse → select → code → run → submit → view history
  - Verify Docker containers are created and cleaned up properly
  - Test with different programming languages
  - Verify progress tracking updates correctly

## Notes

- All tasks are required for comprehensive implementation
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- Docker must be installed and running for execution engine tasks
- Monaco Editor or CodeMirror library should be added to frontend dependencies
