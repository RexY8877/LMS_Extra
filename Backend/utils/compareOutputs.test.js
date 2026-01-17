const fc = require('fast-check');
const compareOutputs = require('./compareOutputs');

// Feature: coding-practice-system, Property 18: Output comparison normalizes whitespace
// Validates: Requirements 6.2

describe('compareOutputs Utility', () => {
  /**
   * Property 18: Output comparison normalizes whitespace
   * For any two outputs that differ only in trailing whitespace or line endings,
   * the comparison should consider them equal.
   */
  test('Property 18: Output comparison normalizes whitespace', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }),
        (baseOutput) => {
          // Generate variations with different whitespace
          const variations = [
            baseOutput,
            `  ${baseOutput}  `, // Leading and trailing spaces
            `\t${baseOutput}\t`, // Leading and trailing tabs
            baseOutput.replace(/\n/g, '\r\n'), // CRLF line endings
            baseOutput.replace(/\n/g, '\n\n'), // Extra newlines
            baseOutput.replace(/ /g, '  '), // Double spaces
            `${baseOutput}\n`, // Trailing newline
            `\n${baseOutput}`, // Leading newline
            baseOutput.replace(/ /g, '\t'), // Tabs instead of spaces
          ];

          // All variations should be considered equal to the base output
          // after normalization
          for (const variation of variations) {
            const result = compareOutputs(baseOutput, variation);
            // The comparison should be true if the normalized versions are the same
            const normalizedBase = baseOutput.trim().replace(/\s+/g, ' ').replace(/\r\n/g, '\n');
            const normalizedVariation = variation.trim().replace(/\s+/g, ' ').replace(/\r\n/g, '\n');
            
            expect(result).toBe(normalizedBase === normalizedVariation);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Additional property: Outputs with different content should not be equal
   */
  test('Property: Different outputs are not equal after normalization', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }),
        fc.string({ minLength: 1, maxLength: 100 }),
        (output1, output2) => {
          // Normalize both outputs
          const normalize = (str) => str.trim().replace(/\s+/g, ' ').replace(/\r\n/g, '\n');
          const normalized1 = normalize(output1);
          const normalized2 = normalize(output2);

          const result = compareOutputs(output1, output2);

          // The result should match whether the normalized versions are equal
          expect(result).toBe(normalized1 === normalized2);
        }
      ),
      { numRuns: 100 }
    );
  });

  // Unit tests for specific edge cases
  describe('Edge cases', () => {
    test('handles null and undefined inputs', () => {
      expect(compareOutputs(null, null)).toBe(true);
      expect(compareOutputs(undefined, undefined)).toBe(true);
      expect(compareOutputs(null, undefined)).toBe(false);
      expect(compareOutputs('test', null)).toBe(false);
      expect(compareOutputs(null, 'test')).toBe(false);
    });

    test('handles empty strings', () => {
      expect(compareOutputs('', '')).toBe(true);
      expect(compareOutputs('  ', '')).toBe(true);
      expect(compareOutputs('\n', '')).toBe(true);
      expect(compareOutputs('\t', '')).toBe(true);
    });

    test('normalizes CRLF to LF', () => {
      expect(compareOutputs('line1\r\nline2', 'line1\nline2')).toBe(true);
      expect(compareOutputs('test\r\n', 'test\n')).toBe(true);
    });

    test('normalizes trailing whitespace', () => {
      expect(compareOutputs('hello world', 'hello world  ')).toBe(true);
      expect(compareOutputs('hello world', '  hello world')).toBe(true);
      expect(compareOutputs('hello world', '  hello world  ')).toBe(true);
    });

    test('collapses multiple spaces', () => {
      expect(compareOutputs('hello  world', 'hello world')).toBe(true);
      expect(compareOutputs('hello   world', 'hello world')).toBe(true);
      expect(compareOutputs('hello\t\tworld', 'hello world')).toBe(true);
    });

    test('handles multiline outputs', () => {
      const output1 = 'line1\nline2\nline3';
      const output2 = 'line1  \nline2  \nline3  ';
      expect(compareOutputs(output1, output2)).toBe(true);
    });

    test('distinguishes different content', () => {
      expect(compareOutputs('hello', 'world')).toBe(false);
      expect(compareOutputs('123', '456')).toBe(false);
      expect(compareOutputs('test', 'testing')).toBe(false);
    });

    test('handles numeric inputs', () => {
      expect(compareOutputs(123, 123)).toBe(true);
      expect(compareOutputs(123, '123')).toBe(true);
      expect(compareOutputs('123  ', 123)).toBe(true);
    });
  });
});
