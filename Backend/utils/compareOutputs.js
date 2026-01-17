/**
 * Compare two outputs for equality after normalization.
 * Normalizes whitespace and line endings before comparison.
 * 
 * @param {string} expected - The expected output
 * @param {string} actual - The actual output from code execution
 * @returns {boolean} - True if outputs are equal after normalization
 */
function compareOutputs(expected, actual) {
  // Handle null/undefined inputs
  if (expected == null || actual == null) {
    return expected === actual;
  }

  // Convert to strings if not already
  const expectedStr = String(expected);
  const actualStr = String(actual);

  // Normalize line endings (CRLF to LF)
  const normalizeLineEndings = (str) => str.replace(/\r\n/g, '\n');

  // Normalize whitespace (trim and collapse multiple spaces)
  const normalizeWhitespace = (str) => {
    return str
      .trim() // Remove leading/trailing whitespace
      .replace(/\s+/g, ' '); // Collapse multiple spaces to single space
  };

  // Apply normalizations
  const normalizedExpected = normalizeWhitespace(normalizeLineEndings(expectedStr));
  const normalizedActual = normalizeWhitespace(normalizeLineEndings(actualStr));

  return normalizedExpected === normalizedActual;
}

module.exports = compareOutputs;
