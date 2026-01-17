const fc = require('fast-check');
const errorHandler = require('./errorHandler');

describe('ErrorHandler - Error Parsing', () => {
  // Feature: coding-practice-system, Property 10: Execution errors include diagnostic information
  // Validates: Requirements 4.3
  describe('Property 10: Execution errors include diagnostic information', () => {
    test('should include error type, message, and diagnostic info for all errors', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            language: fc.constantFrom('python', 'javascript', 'java'),
            errorType: fc.constantFrom('syntax', 'runtime'),
            hasLineNumber: fc.boolean(),
          }),
          async ({ language, errorType, hasLineNumber }) => {
            let execution;

            // Generate appropriate error based on language and type
            if (language === 'python') {
              if (errorType === 'syntax') {
                execution = {
                  stderr: hasLineNumber 
                    ? '  File "solution.py", line 5\n    print(x\n          ^\nSyntaxError: unexpected EOF while parsing'
                    : 'SyntaxError: invalid syntax',
                  stdout: '',
                  exitCode: 1,
                };
              } else {
                execution = {
                  stderr: hasLineNumber
                    ? 'Traceback (most recent call last):\n  File "solution.py", line 3, in <module>\n    print(x)\nNameError: name \'x\' is not defined'
                    : 'NameError: name \'x\' is not defined',
                  stdout: '',
                  exitCode: 1,
                };
              }
            } else if (language === 'javascript') {
              if (errorType === 'syntax') {
                execution = {
                  stderr: hasLineNumber
                    ? 'SyntaxError: Unexpected token \'}\'\n    at Module._compile (solution.js:5:10)'
                    : 'SyntaxError: Unexpected token',
                  stdout: '',
                  exitCode: 1,
                };
              } else {
                execution = {
                  stderr: hasLineNumber
                    ? 'ReferenceError: x is not defined\n    at Object.<anonymous> (solution.js:3:13)'
                    : 'ReferenceError: x is not defined',
                  stdout: '',
                  exitCode: 1,
                };
              }
            } else { // java
              if (errorType === 'syntax') {
                execution = {
                  stderr: hasLineNumber
                    ? 'Solution.java:3: error: \';\' expected\n    System.out.println(x)\n                         ^'
                    : 'error: \';\' expected',
                  stdout: '',
                  exitCode: 1,
                };
              } else {
                execution = {
                  stderr: hasLineNumber
                    ? 'Exception in thread "main" java.lang.NullPointerException\n\tat Solution.main(Solution.java:7)'
                    : 'Exception in thread "main" java.lang.NullPointerException',
                  stdout: '',
                  exitCode: 1,
                };
              }
            }

            const error = errorHandler.parseError(execution, language);

            // Verify error includes diagnostic information
            expect(error).not.toBeNull();
            expect(error.type).toBeDefined();
            expect(error.message).toBeDefined();
            expect(error.stackTrace).toBeDefined();
            
            // If the error had line number info, verify it was extracted
            if (hasLineNumber) {
              expect(error.line).not.toBeNull();
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // Feature: coding-practice-system, Property 36: Syntax errors include location information
  // Validates: Requirements 12.3
  describe('Property 36: Syntax errors include location information', () => {
    test('should extract line and column numbers from syntax errors', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            language: fc.constantFrom('python', 'javascript', 'java'),
            line: fc.integer({ min: 1, max: 100 }),
          }),
          async ({ language, line }) => {
            let execution;

            // Generate syntax error with line number
            if (language === 'python') {
              execution = {
                stderr: `  File "solution.py", line ${line}\n    print(x\n          ^\nSyntaxError: unexpected EOF while parsing`,
                stdout: '',
                exitCode: 1,
              };
            } else if (language === 'javascript') {
              execution = {
                stderr: `SyntaxError: Unexpected token '}'\n    at Module._compile (solution.js:${line}:10)`,
                stdout: '',
                exitCode: 1,
              };
            } else { // java
              execution = {
                stderr: `Solution.java:${line}: error: ';' expected\n    System.out.println(x)\n                         ^`,
                stdout: '',
                exitCode: 1,
              };
            }

            const error = errorHandler.parseError(execution, language);

            // Verify line number was extracted
            expect(error).not.toBeNull();
            expect(error.type).toBe('Compilation Error');
            expect(error.line).toBe(line);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // Feature: coding-practice-system, Property 37: Runtime errors include stack traces
  // Validates: Requirements 12.4
  describe('Property 37: Runtime errors include stack traces', () => {
    test('should include stack trace for all runtime errors', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            language: fc.constantFrom('python', 'javascript', 'java'),
            line: fc.integer({ min: 1, max: 100 }),
          }),
          async ({ language, line }) => {
            let execution;

            // Generate runtime error with stack trace
            if (language === 'python') {
              execution = {
                stderr: `Traceback (most recent call last):\n  File "solution.py", line ${line}, in <module>\n    print(x)\nNameError: name 'x' is not defined`,
                stdout: '',
                exitCode: 1,
              };
            } else if (language === 'javascript') {
              execution = {
                stderr: `ReferenceError: x is not defined\n    at Object.<anonymous> (solution.js:${line}:13)\n    at Module._compile (internal/modules/cjs/loader.js:1063:30)`,
                stdout: '',
                exitCode: 1,
              };
            } else { // java
              execution = {
                stderr: `Exception in thread "main" java.lang.NullPointerException\n\tat Solution.main(Solution.java:${line})\n\tat java.base/java.lang.reflect.Method.invoke(Method.java:566)`,
                stdout: '',
                exitCode: 1,
              };
            }

            const error = errorHandler.parseError(execution, language);

            // Verify stack trace is included
            expect(error).not.toBeNull();
            expect(error.type).toBe('Runtime Error');
            expect(error.stackTrace).toBeDefined();
            expect(error.stackTrace.length).toBeGreaterThan(0);
            expect(error.line).toBe(line);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // Additional unit tests for specific error formats
  describe('Python error parsing', () => {
    test('should parse Python SyntaxError correctly', () => {
      const execution = {
        stderr: '  File "solution.py", line 3\n    print(x\n          ^\nSyntaxError: unexpected EOF while parsing',
        stdout: '',
        exitCode: 1,
      };

      const error = errorHandler.parseError(execution, 'python');

      expect(error.type).toBe('Compilation Error');
      expect(error.line).toBe(3);
      expect(error.message).toContain('SyntaxError');
    });

    test('should parse Python NameError correctly', () => {
      const execution = {
        stderr: 'Traceback (most recent call last):\n  File "solution.py", line 5, in <module>\n    print(x)\nNameError: name \'x\' is not defined',
        stdout: '',
        exitCode: 1,
      };

      const error = errorHandler.parseError(execution, 'python');

      expect(error.type).toBe('Runtime Error');
      expect(error.line).toBe(5);
      expect(error.errorType).toBe('NameError');
    });
  });

  describe('JavaScript error parsing', () => {
    test('should parse JavaScript SyntaxError correctly', () => {
      const execution = {
        stderr: 'SyntaxError: Unexpected token \'}\'\n    at Module._compile (solution.js:7:10)',
        stdout: '',
        exitCode: 1,
      };

      const error = errorHandler.parseError(execution, 'javascript');

      expect(error.type).toBe('Compilation Error');
      expect(error.line).toBe(7);
      expect(error.column).toBe(10);
    });

    test('should parse JavaScript ReferenceError correctly', () => {
      const execution = {
        stderr: 'ReferenceError: x is not defined\n    at Object.<anonymous> (solution.js:3:13)',
        stdout: '',
        exitCode: 1,
      };

      const error = errorHandler.parseError(execution, 'javascript');

      expect(error.type).toBe('Runtime Error');
      expect(error.line).toBe(3);
      expect(error.errorType).toBe('ReferenceError');
    });
  });

  describe('Java error parsing', () => {
    test('should parse Java compilation error correctly', () => {
      const execution = {
        stderr: 'Solution.java:3: error: \';\' expected\n    System.out.println(x)\n                         ^',
        stdout: '',
        exitCode: 1,
      };

      const error = errorHandler.parseError(execution, 'java');

      expect(error.type).toBe('Compilation Error');
      expect(error.line).toBe(3);
      expect(error.message).toContain('expected');
    });

    test('should parse Java NullPointerException correctly', () => {
      const execution = {
        stderr: 'Exception in thread "main" java.lang.NullPointerException\n\tat Solution.main(Solution.java:7)',
        stdout: '',
        exitCode: 1,
      };

      const error = errorHandler.parseError(execution, 'java');

      expect(error.type).toBe('Runtime Error');
      expect(error.line).toBe(7);
      expect(error.errorType).toBe('NullPointerException');
    });
  });
});
