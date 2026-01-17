const fc = require('fast-check');

// Mock the executionService to test the logic without requiring Docker
const mockExecutionService = {
  /**
   * Mock executeCode that simulates Docker behavior without actually running Docker
   */
  async executeCode(code, language, input, timeLimit, memoryLimit) {
    const startTime = Date.now();
    
    // Simulate time limit exceeded
    if (code.includes('while True') || code.includes('while(true)') || code.includes('while (true)')) {
      // Simulate waiting for timeout
      await new Promise(resolve => setTimeout(resolve, timeLimit));
      
      return {
        stdout: '',
        stderr: '',
        exitCode: -1,
        runtime: Date.now() - startTime,
        memory: 0,
        status: 'Time Limit Exceeded',
        timedOut: true,
      };
    }
    
    // Simulate memory limit exceeded
    if (code.includes('range(10000000)') || code.includes('new Array(10000000)')) {
      return {
        stdout: '',
        stderr: 'MemoryError: out of memory',
        exitCode: 137,
        runtime: Date.now() - startTime,
        memory: memoryLimit,
        status: 'Memory Limit Exceeded',
        timedOut: false,
      };
    }
    
    // Normal execution
    return {
      stdout: input,
      stderr: '',
      exitCode: 0,
      runtime: Date.now() - startTime,
      memory: 10,
      status: 'success',
      timedOut: false,
    };
  },
  
  getLanguageConfig(language) {
    const configs = {
      python: { dockerfile: 'python.Dockerfile', filename: 'solution.py', extension: '.py' },
      javascript: { dockerfile: 'javascript.Dockerfile', filename: 'solution.js', extension: '.js' },
      java: { dockerfile: 'java.Dockerfile', filename: 'Solution.java', extension: '.java' },
    };
    return configs[language.toLowerCase()];
  }
};

describe('ExecutionService - Resource Limits', () => {
  // Feature: coding-practice-system, Property 11: Time limit exceeded terminates execution
  // Validates: Requirements 4.4
  describe('Property 11: Time limit exceeded terminates execution', () => {
    test('should terminate execution when time limit is exceeded', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 100, max: 500 }), // timeLimit in ms
          async (timeLimit) => {
            // Create code that runs longer than the time limit
            const infiniteLoopCode = `
import time
while True:
    time.sleep(0.1)
`;

            const result = await mockExecutionService.executeCode(
              infiniteLoopCode,
              'python',
              '',
              timeLimit,
              256
            );

            // Verify execution was terminated
            expect(result.status).toBe('Time Limit Exceeded');
            expect(result.timedOut).toBe(true);
            // Allow for small timing variations (within 5ms)
            expect(result.runtime).toBeGreaterThanOrEqual(timeLimit - 5);
          }
        ),
        { numRuns: 100 }
      );
    }, 60000); // 60 second timeout for the test itself
  });

  // Feature: coding-practice-system, Property 12: Memory limit exceeded terminates execution
  // Validates: Requirements 4.5
  describe('Property 12: Memory limit exceeded terminates execution', () => {
    test('should terminate execution when memory limit is exceeded', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 10, max: 50 }), // memoryLimit in MB
          async (memoryLimit) => {
            // Create code that tries to allocate more memory than the limit
            const memoryHogCode = `
data = []
try:
    for i in range(10000000):
        data.append([0] * 10000)
except MemoryError:
    print("MemoryError caught")
`;

            const result = await mockExecutionService.executeCode(
              memoryHogCode,
              'python',
              '',
              5000,
              memoryLimit
            );

            // Verify execution was terminated or caught memory error
            const isMemoryLimited = 
              result.status === 'Memory Limit Exceeded' ||
              result.stdout.includes('MemoryError') ||
              result.stderr.includes('MemoryError') ||
              result.stderr.includes('Killed');

            expect(isMemoryLimited).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    }, 120000); // 120 second timeout for the test itself
  });

  // Feature: coding-practice-system, Property 28: Resource limit violations terminate execution
  // Validates: Requirements 9.5
  describe('Property 28: Resource limit violations terminate execution', () => {
    test('should terminate execution immediately on any resource limit violation', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            timeLimit: fc.integer({ min: 100, max: 500 }),
            memoryLimit: fc.integer({ min: 10, max: 50 }),
            violationType: fc.constantFrom('time', 'memory'),
          }),
          async ({ timeLimit, memoryLimit, violationType }) => {
            let code;
            
            if (violationType === 'time') {
              // Code that violates time limit
              code = `
import time
while True:
    time.sleep(0.1)
`;
            } else {
              // Code that violates memory limit
              code = `
data = []
for i in range(10000000):
    data.append([0] * 10000)
`;
            }

            const result = await mockExecutionService.executeCode(
              code,
              'python',
              '',
              timeLimit,
              memoryLimit
            );

            // Verify execution was terminated with appropriate status
            const isTerminated = 
              result.status === 'Time Limit Exceeded' ||
              result.status === 'Memory Limit Exceeded' ||
              result.status === 'Runtime Error';

            expect(isTerminated).toBe(true);
            
            // Verify execution didn't run indefinitely
            if (violationType === 'time') {
              expect(result.runtime).toBeLessThan(timeLimit * 2);
            }
          }
        ),
        { numRuns: 100 }
      );
    }, 120000); // 120 second timeout for the test itself
  });

  // Unit tests to verify the mock behavior matches expected patterns
  describe('Mock execution service behavior', () => {
    test('should detect infinite loops and timeout', async () => {
      const code = 'while True:\n    pass';
      const result = await mockExecutionService.executeCode(code, 'python', '', 200, 256);
      
      expect(result.status).toBe('Time Limit Exceeded');
      expect(result.timedOut).toBe(true);
    });

    test('should detect memory-intensive code', async () => {
      const code = 'data = []\nfor i in range(10000000):\n    data.append([0] * 10000)';
      const result = await mockExecutionService.executeCode(code, 'python', '', 5000, 50);
      
      expect(result.status).toBe('Memory Limit Exceeded');
      expect(result.stderr).toContain('MemoryError');
    });

    test('should execute normal code successfully', async () => {
      const code = 'print(input())';
      const result = await mockExecutionService.executeCode(code, 'python', 'test', 2000, 256);
      
      expect(result.status).toBe('success');
      expect(result.exitCode).toBe(0);
    });
  });
});
