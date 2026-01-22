const fc = require('fast-check');
const fs = require('fs').promises;
const path = require('path');
const pdfProcessingService = require('./pdfProcessingService');

// Mock pdf-parse for testing
jest.mock('pdf-parse', () => {
  return jest.fn((buffer) => {
    // Simulate successful PDF parsing
    return Promise.resolve({
      numpages: 1,
      text: 'Sample PDF content',
      info: {
        Title: 'Test PDF',
        Author: 'Test Author',
        Subject: 'Test Subject',
        Creator: 'Test Creator',
        Producer: 'Test Producer',
        CreationDate: new Date('2023-01-01'),
        ModDate: new Date('2023-01-02')
      }
    });
  });
});

describe('PDF Processing Service', () => {
  const testPDFPath = path.join(__dirname, '../temp/test.pdf');
  
  beforeAll(async () => {
    // Ensure temp directory exists
    const tempDir = path.dirname(testPDFPath);
    try {
      await fs.mkdir(tempDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }
    
    // Create a simple test file (doesn't need to be valid PDF since we're mocking)
    const testContent = Buffer.from('%PDF-1.4\nTest content\n%%EOF');
    await fs.writeFile(testPDFPath, testContent);
  });
  
  afterAll(async () => {
    // Clean up test file
    try {
      await fs.unlink(testPDFPath);
    } catch (error) {
      // File might not exist
    }
  });

  describe('extractMetadata', () => {
    test('should extract basic metadata from valid PDF', async () => {
      const metadata = await pdfProcessingService.extractMetadata(testPDFPath);
      
      expect(metadata).toHaveProperty('pageCount');
      expect(metadata).toHaveProperty('fileSizeBytes');
      expect(metadata).toHaveProperty('fileSizeMB');
      expect(metadata).toHaveProperty('extractedAt');
      expect(metadata.pageCount).toBeGreaterThan(0);
      expect(metadata.fileSizeBytes).toBeGreaterThan(0);
      expect(metadata.fileSizeMB).toBeGreaterThanOrEqual(0); // Small files can be 0.00 MB
      expect(metadata.extractedAt).toBeInstanceOf(Date);
    });

    test('should throw error for non-existent file', async () => {
      await expect(pdfProcessingService.extractMetadata('/non/existent/file.pdf'))
        .rejects.toThrow('Failed to extract PDF metadata');
    });
  });

  describe('isValidPDF', () => {
    test('should return true for valid PDF', async () => {
      const isValid = await pdfProcessingService.isValidPDF(testPDFPath);
      expect(isValid).toBe(true);
    });

    test('should return false for non-existent file', async () => {
      const isValid = await pdfProcessingService.isValidPDF('/non/existent/file.pdf');
      expect(isValid).toBe(false);
    });
  });

  describe('getProcessingSummary', () => {
    test('should return complete processing summary', async () => {
      const summary = await pdfProcessingService.getProcessingSummary(testPDFPath);
      
      expect(summary).toHaveProperty('isValid');
      expect(summary).toHaveProperty('metadata');
      expect(summary).toHaveProperty('processedAt');
      expect(summary).toHaveProperty('status');
      expect(summary.isValid).toBe(true);
      expect(summary.status).toBe('success');
      expect(summary.processedAt).toBeInstanceOf(Date);
    });
  });

  // Property Test 15: PDF metadata is extracted correctly
  describe('Property 15: PDF metadata is extracted correctly', () => {
    test('PDF metadata extraction properties', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            // We can't generate arbitrary PDFs, so we test with our known valid PDF
            // and verify the properties of the extracted metadata
            testCase: fc.constant('valid_pdf')
          }),
          async ({ testCase }) => {
            if (testCase === 'valid_pdf') {
              const metadata = await pdfProcessingService.extractMetadata(testPDFPath);
              
              // Property: Metadata should always contain required fields
              expect(metadata).toHaveProperty('pageCount');
              expect(metadata).toHaveProperty('fileSizeBytes');
              expect(metadata).toHaveProperty('fileSizeMB');
              expect(metadata).toHaveProperty('extractedAt');
              
              // Property: Page count should be positive integer
              expect(Number.isInteger(metadata.pageCount)).toBe(true);
              expect(metadata.pageCount).toBeGreaterThan(0);
              
              // Property: File size should be positive
              expect(metadata.fileSizeBytes).toBeGreaterThan(0);
              expect(metadata.fileSizeMB).toBeGreaterThanOrEqual(0); // Small files can be 0.00 MB
              
              // Property: File size in MB should be calculated correctly
              const expectedMB = parseFloat((metadata.fileSizeBytes / (1024 * 1024)).toFixed(2));
              expect(metadata.fileSizeMB).toBe(expectedMB);
              
              // Property: Extraction timestamp should be recent
              const now = new Date();
              const timeDiff = now - metadata.extractedAt;
              expect(timeDiff).toBeLessThan(5000); // Within 5 seconds
              
              // Property: Text length should be non-negative
              expect(metadata.textLength).toBeGreaterThanOrEqual(0);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});