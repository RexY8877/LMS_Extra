/**
 * Error handler service for parsing and formatting execution errors
 */
class ErrorHandler {
  /**
   * Parse and format execution errors
   * @param {Object} execution - Execution result from executionService
   * @param {string} language - Programming language
   * @returns {Object} Formatted error with type, message, line, and stackTrace
   */
  parseError(execution, language) {
    if (!execution.stderr && execution.exitCode === 0) {
      return null;
    }

    const stderr = execution.stderr || '';
    const stdout = execution.stdout || '';

    // Check for compilation/syntax errors
    const compilationError = this.parseCompilationError(stderr, language);
    if (compilationError) {
      return compilationError;
    }

    // Check for runtime errors
    const runtimeError = this.parseRuntimeError(stderr, stdout, language);
    if (runtimeError) {
      return runtimeError;
    }

    // Generic error
    return {
      type: 'Runtime Error',
      message: stderr || 'Unknown error occurred',
      line: null,
      column: null,
      stackTrace: stderr,
    };
  }

  /**
   * Parse compilation/syntax errors
   * @param {string} stderr - Standard error output
   * @param {string} language - Programming language
   * @returns {Object|null} Parsed error or null
   */
  parseCompilationError(stderr, language) {
    if (!stderr) return null;

    switch (language.toLowerCase()) {
      case 'python':
        return this.parsePythonSyntaxError(stderr);
      case 'javascript':
        return this.parseJavaScriptSyntaxError(stderr);
      case 'java':
        return this.parseJavaCompilationError(stderr);
      default:
        return null;
    }
  }

  /**
   * Parse Python syntax errors
   * Example: "  File "solution.py", line 3\n    print(x\n          ^\nSyntaxError: unexpected EOF while parsing"
   */
  parsePythonSyntaxError(stderr) {
    // Check for SyntaxError
    if (stderr.includes('SyntaxError') || stderr.includes('IndentationError')) {
      const lineMatch = stderr.match(/line (\d+)/);
      const line = lineMatch ? parseInt(lineMatch[1]) : null;

      // Extract error message
      const errorLines = stderr.split('\n');
      const errorMessageLine = errorLines.find(l => 
        l.includes('SyntaxError:') || l.includes('IndentationError:')
      );
      const message = errorMessageLine || 'Syntax error';

      return {
        type: 'Compilation Error',
        message: message.trim(),
        line,
        column: null,
        stackTrace: stderr,
      };
    }

    return null;
  }

  /**
   * Parse JavaScript syntax errors
   * Example: "SyntaxError: Unexpected token '}'\n    at Module._compile (internal/modules/cjs/loader.js:723:23)"
   */
  parseJavaScriptSyntaxError(stderr) {
    if (stderr.includes('SyntaxError')) {
      const lines = stderr.split('\n');
      const errorLine = lines[0];
      
      // Try to extract line number from stack trace
      const lineMatch = stderr.match(/solution\.js:(\d+):(\d+)/);
      const line = lineMatch ? parseInt(lineMatch[1]) : null;
      const column = lineMatch ? parseInt(lineMatch[2]) : null;

      return {
        type: 'Compilation Error',
        message: errorLine.trim(),
        line,
        column,
        stackTrace: stderr,
      };
    }

    return null;
  }

  /**
   * Parse Java compilation errors
   * Example: "Solution.java:3: error: ';' expected\n    System.out.println(x)\n                         ^"
   */
  parseJavaCompilationError(stderr) {
    if (stderr.includes('error:')) {
      const lineMatch = stderr.match(/Solution\.java:(\d+):/);
      const line = lineMatch ? parseInt(lineMatch[1]) : null;

      // Extract error message
      const errorMatch = stderr.match(/error: (.+)/);
      const message = errorMatch ? errorMatch[1] : 'Compilation error';

      return {
        type: 'Compilation Error',
        message: message.trim(),
        line,
        column: null,
        stackTrace: stderr,
      };
    }

    return null;
  }

  /**
   * Parse runtime errors
   * @param {string} stderr - Standard error output
   * @param {string} stdout - Standard output
   * @param {string} language - Programming language
   * @returns {Object|null} Parsed error or null
   */
  parseRuntimeError(stderr, stdout, language) {
    if (!stderr) return null;

    switch (language.toLowerCase()) {
      case 'python':
        return this.parsePythonRuntimeError(stderr);
      case 'javascript':
        return this.parseJavaScriptRuntimeError(stderr);
      case 'java':
        return this.parseJavaRuntimeError(stderr);
      default:
        return null;
    }
  }

  /**
   * Parse Python runtime errors
   * Example: "Traceback (most recent call last):\n  File "solution.py", line 5, in <module>\n    print(x)\nNameError: name 'x' is not defined"
   */
  parsePythonRuntimeError(stderr) {
    if (stderr.includes('Traceback')) {
      // Extract line number
      const lineMatch = stderr.match(/line (\d+)/);
      const line = lineMatch ? parseInt(lineMatch[1]) : null;

      // Extract error type and message
      const errorLines = stderr.split('\n');
      const errorMessageLine = errorLines[errorLines.length - 1] || errorLines[errorLines.length - 2];
      
      // Extract error type
      const errorTypeMatch = errorMessageLine.match(/^(\w+Error):/);
      const errorType = errorTypeMatch ? errorTypeMatch[1] : 'Runtime Error';

      return {
        type: 'Runtime Error',
        message: errorMessageLine.trim(),
        line,
        column: null,
        stackTrace: stderr,
        errorType,
      };
    }

    return null;
  }

  /**
   * Parse JavaScript runtime errors
   * Example: "ReferenceError: x is not defined\n    at Object.<anonymous> (solution.js:3:13)"
   */
  parseJavaScriptRuntimeError(stderr) {
    const errorLines = stderr.split('\n');
    const errorLine = errorLines[0];

    // Extract line number from stack trace
    const lineMatch = stderr.match(/solution\.js:(\d+):(\d+)/);
    const line = lineMatch ? parseInt(lineMatch[1]) : null;
    const column = lineMatch ? parseInt(lineMatch[2]) : null;

    // Extract error type
    const errorTypeMatch = errorLine.match(/^(\w+Error):/);
    const errorType = errorTypeMatch ? errorTypeMatch[1] : 'Runtime Error';

    return {
      type: 'Runtime Error',
      message: errorLine.trim(),
      line,
      column,
      stackTrace: stderr,
      errorType,
    };
  }

  /**
   * Parse Java runtime errors
   * Example: "Exception in thread "main" java.lang.ArrayIndexOutOfBoundsException: Index 5 out of bounds for length 3\n\tat Solution.main(Solution.java:7)"
   */
  parseJavaRuntimeError(stderr) {
    if (stderr.includes('Exception')) {
      const errorLines = stderr.split('\n');
      const errorLine = errorLines[0];

      // Extract line number from stack trace
      const lineMatch = stderr.match(/Solution\.java:(\d+)/);
      const line = lineMatch ? parseInt(lineMatch[1]) : null;

      // Extract exception type - handle both with and without colon
      let errorType = 'Runtime Error';
      const exceptionMatchWithColon = errorLine.match(/(\w+Exception):/);
      if (exceptionMatchWithColon) {
        errorType = exceptionMatchWithColon[1];
      } else {
        const exceptionMatchWithoutColon = errorLine.match(/java\.lang\.(\w+Exception)/);
        if (exceptionMatchWithoutColon) {
          errorType = exceptionMatchWithoutColon[1];
        }
      }

      return {
        type: 'Runtime Error',
        message: errorLine.replace('Exception in thread "main" ', '').trim(),
        line,
        column: null,
        stackTrace: stderr,
        errorType,
      };
    }

    return null;
  }

  /**
   * Format error for display
   * @param {Object} error - Parsed error object
   * @returns {string} Formatted error message
   */
  formatError(error) {
    if (!error) return '';

    let formatted = `${error.type}: ${error.message}`;

    if (error.line) {
      formatted += `\nLine: ${error.line}`;
    }

    if (error.column) {
      formatted += `, Column: ${error.column}`;
    }

    if (error.stackTrace) {
      formatted += `\n\nStack Trace:\n${error.stackTrace}`;
    }

    return formatted;
  }
}

module.exports = new ErrorHandler();
