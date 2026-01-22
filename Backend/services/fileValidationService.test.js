const fc = require('fast-check');
const FileValidationService = require('./fileValidationService');

describe('FileValidationService', () => {
  let validationService;

  beforeEach(() => {
    validationService = new FileValidationService();
  });

  describe('Unit Tests', () => {
    describe('validateFileType', () => {
      test('should accept valid PDF MIME type', () => {
        const result = validationService.validateFileType('application/pdf', 'pdf');
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      test('should accept valid video MIME types', () => {
        const validVideoTypes = ['video/mp4', 'video/avi', 'video/x-msvideo', 'video/quicktime'];
        
        validVideoTypes.forEach(mimeType => {
          const result = validationService.validateFileType(mimeType, 'video');
          expect(result.isValid).toBe(true);
          expect(result.errors).toHaveLength(0);
        });
      });

      test('should reject invalid MIME types', () => {
        const result = validationService.validateFileType('text/plain', 'pdf');
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Invalid file type. Expected: application/pdf, got: text/plain');
      });
    });

    describe('validateFileSize', () => {
      test('should accept files within size limits', () => {
        const pdfResult = validationService.validateFileSize(10 * 1024 * 1024, 'pdf'); // 10MB
        expect(pdfResult.isValid).toBe(true);

        const videoResult = validationService.validateFileSize(100 * 1024 * 1024, 'video'); // 100MB
        expect(videoResult.isValid).toBe(true);
      });

      test('should reject files exceeding size limits', () => {
        const pdfResult = validationService.validateFileSize(60 * 1024 * 1024, 'pdf'); // 60MB
        expect(pdfResult.isValid).toBe(false);
        expect(pdfResult.errors[0]).toContain('File too large');

        const videoResult = validationService.validateFileSize(600 * 1024 * 1024, 'video'); // 600MB
        expect(videoResult.isValid).toBe(false);
        expect(videoResult.errors[0]).toContain('File too large');
      });
    });

    describe('validateFilename', () => {
      test('should accept safe filenames', () => {
        const result = validationService.validateFilename('document.pdf');
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      test('should reject dangerous extensions', () => {
        const result = validationService.validateFilename('malware.exe');
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Dangerous file extension not allowed: .exe');
      });

      test('should reject path traversal attempts', () => {
        const result = validationService.validateFilename('../../../etc/passwd');
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Filename contains invalid path characters');
      });
    });

    describe('sanitizeFilename', () => {
      test('should remove dangerous characters', () => {
        const result = validationService.sanitizeFilename('file<>name.pdf');
        expect(result).toBe('file__name.pdf');
      });

      test('should handle empty filenames', () => {
        const result = validationService.sanitizeFilename('');
        expect(result).toBe('unnamed_file');
      });
    });
  });

  describe('Property-Based Tests', () => {
    /**
     * Property 13: File uploads validate type and size
     * **Validates: Requirements 5.1, 6.1**
     * **Feature: faculty-tools-course-management, Property 13: File uploads validate type and size**
     */
    test('Property 13: File uploads validate type and size', () => {
      fc.assert(
        fc.property(
          fc.record({
            mimetype: fc.oneof(
              fc.constantFrom('application/pdf', 'video/mp4', 'video/avi', 'video/x-msvideo', 'video/quicktime'),
              fc.constantFrom('text/plain', 'image/jpeg', 'application/javascript', 'text/html')
            ),
            size: fc.integer({ min: 1, max: 1000 * 1024 * 1024 }), // 1 byte to 1GB
            originalname: fc.string({ minLength: 1, maxLength: 100 }).map(s => s + '.pdf')
          }),
          fc.constantFrom('pdf', 'video'),
          (file, expectedType) => {
            const result = validationService.validateFile(file, expectedType);
            
            // Check that validation result is consistent
            if (result.isValid) {
              expect(result.errors).toHaveLength(0);
            } else {
              expect(result.errors.length).toBeGreaterThan(0);
            }

            // Check type validation logic
            const allowedTypes = validationService.getAllowedTypes(expectedType);
            const sizeLimit = validationService.getSizeLimit(expectedType);
            
            if (allowedTypes.includes(file.mimetype) && file.size <= sizeLimit) {
              // Should be valid if type and size are within limits (assuming safe filename)
              const filenameValidation = validationService.validateFilename(file.originalname);
              if (filenameValidation.isValid) {
                expect(result.isValid).toBe(true);
              }
            } else {
              // Should be invalid if type or size exceeds limits
              if (!allowedTypes.includes(file.mimetype) || file.size > sizeLimit) {
                expect(result.isValid).toBe(false);
              }
            }

            // Sanitized filename should always be provided
            expect(typeof result.sanitizedFilename).toBe('string');
            expect(result.sanitizedFilename.length).toBeGreaterThan(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('Property: File type validation is consistent', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('application/pdf', 'video/mp4', 'video/avi', 'text/plain', 'image/jpeg'),
          fc.constantFrom('pdf', 'video'),
          (mimetype, expectedType) => {
            const result1 = validationService.validateFileType(mimetype, expectedType);
            const result2 = validationService.validateFileType(mimetype, expectedType);
            
            // Same inputs should always produce same results
            expect(result1.isValid).toBe(result2.isValid);
            expect(result1.errors).toEqual(result2.errors);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('Property: File size validation is monotonic', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 100 * 1024 * 1024 }),
          fc.constantFrom('pdf', 'video'),
          (baseSize, fileType) => {
            const smallerSize = Math.floor(baseSize * 0.5);
            const largerSize = baseSize * 2;
            
            const smallResult = validationService.validateFileSize(smallerSize, fileType);
            const largeResult = validationService.validateFileSize(largerSize, fileType);
            
            // If smaller size is invalid, larger size should also be invalid
            if (!smallResult.isValid) {
              expect(largeResult.isValid).toBe(false);
            }
            
            // If larger size is valid, smaller size should also be valid
            if (largeResult.isValid) {
              expect(smallResult.isValid).toBe(true);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    test('Property: Filename sanitization is safe', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 300 }),
          (filename) => {
            const sanitized = validationService.sanitizeFilename(filename);
            
            // Sanitized filename should not contain dangerous characters
            expect(sanitized).not.toMatch(/[\/\\:*?"<>|]/);
            expect(sanitized).not.toMatch(/\0/);
            expect(sanitized).not.toMatch(/^\./);
            expect(sanitized).not.toMatch(/\.$/);
            
            // Should not be empty
            expect(sanitized.length).toBeGreaterThan(0);
            
            // Should not exceed length limit
            expect(sanitized.length).toBeLessThanOrEqual(255);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});