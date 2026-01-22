const fc = require('fast-check');
const { SignedUrlService } = require('./signedUrlService');

describe('SignedUrlService', () => {
  let signedUrlService;

  beforeEach(() => {
    // Create a new instance for each test to avoid state pollution
    signedUrlService = new SignedUrlService();
  });

  describe('Unit Tests', () => {
    describe('generateSignedUrl', () => {
      test('should generate valid signed URL with all required components', () => {
        const contentId = 'content-123';
        const userId = 'user-456';
        const result = signedUrlService.generateSignedUrl(contentId, userId);

        expect(result).toHaveProperty('url');
        expect(result).toHaveProperty('expiresAt');
        expect(result).toHaveProperty('signature');
        expect(result).toHaveProperty('contentId', contentId);
        expect(result).toHaveProperty('userId', userId);
        
        expect(result.url).toContain(contentId);
        expect(result.url).toContain('expires=');
        expect(result.url).toContain('signature=');
        expect(result.url).toContain('user=');
      });

      test('should generate URLs that expire in the future', () => {
        const result = signedUrlService.generateSignedUrl('content-123', 'user-456');
        expect(result.expiresAt.getTime()).toBeGreaterThan(Date.now());
      });

      test('should respect custom expiration hours', () => {
        const customHours = 12;
        const result = signedUrlService.generateSignedUrl('content-123', 'user-456', customHours);
        
        const expectedExpiration = Date.now() + (customHours * 60 * 60 * 1000);
        const actualExpiration = result.expiresAt.getTime();
        
        // Allow 1 second tolerance for execution time
        expect(Math.abs(actualExpiration - expectedExpiration)).toBeLessThan(1000);
      });
    });

    describe('verifySignedUrl', () => {
      test('should verify valid signed URLs', () => {
        const contentId = 'content-123';
        const userId = 'user-456';
        const signedUrl = signedUrlService.generateSignedUrl(contentId, userId);
        
        const verification = signedUrlService.verifySignedUrl(
          contentId,
          userId,
          signedUrl.expiresAt.getTime().toString(),
          signedUrl.signature
        );

        expect(verification.isValid).toBe(true);
        expect(verification.isExpired).toBe(false);
        expect(verification.error).toBeNull();
      });

      test('should reject expired URLs', () => {
        const contentId = 'content-123';
        const userId = 'user-456';
        const pastTime = Date.now() - 1000; // 1 second ago
        const signature = signedUrlService.createSignature(contentId, userId, pastTime);
        
        const verification = signedUrlService.verifySignedUrl(
          contentId,
          userId,
          pastTime.toString(),
          signature
        );

        expect(verification.isValid).toBe(false);
        expect(verification.isExpired).toBe(true);
        expect(verification.error).toContain('expired');
      });

      test('should reject invalid signatures', () => {
        const contentId = 'content-123';
        const userId = 'user-456';
        const futureTime = Date.now() + 86400000; // 24 hours from now
        const invalidSignature = 'invalid-signature';
        
        const verification = signedUrlService.verifySignedUrl(
          contentId,
          userId,
          futureTime.toString(),
          invalidSignature
        );

        expect(verification.isValid).toBe(false);
        expect(verification.isExpired).toBe(false);
        expect(verification.error).toContain('Invalid signature');
      });
    });

    describe('constantTimeCompare', () => {
      test('should return true for identical strings', () => {
        const str = 'test-string-123';
        expect(signedUrlService.constantTimeCompare(str, str)).toBe(true);
      });

      test('should return false for different strings', () => {
        expect(signedUrlService.constantTimeCompare('abc', 'def')).toBe(false);
      });

      test('should return false for strings of different lengths', () => {
        expect(signedUrlService.constantTimeCompare('abc', 'abcd')).toBe(false);
      });
    });
  });

  describe('Property-Based Tests', () => {
    /**
     * Property 14: Uploaded files generate unique access URLs
     * **Validates: Requirements 5.2**
     * **Feature: faculty-tools-course-management, Property 14: Uploaded files generate unique access URLs**
     */
    test('Property 14: Uploaded files generate unique access URLs', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              contentId: fc.string({ minLength: 1, maxLength: 50 }),
              userId: fc.string({ minLength: 1, maxLength: 50 })
            }),
            { minLength: 2, maxLength: 10 }
          ),
          (contentItems) => {
            const signedUrls = contentItems.map(item => 
              signedUrlService.generateSignedUrl(item.contentId, item.userId)
            );

            // All URLs should be unique
            const urls = signedUrls.map(result => result.url);
            const uniqueUrls = new Set(urls);
            expect(uniqueUrls.size).toBe(urls.length);

            // All signatures should be unique (assuming different content/user combinations)
            const signatures = signedUrls.map(result => result.signature);
            const uniqueSignatures = new Set(signatures);
            
            // If all contentId/userId combinations are unique, signatures should be unique
            const uniqueCombinations = new Set(contentItems.map(item => `${item.contentId}:${item.userId}`));
            if (uniqueCombinations.size === contentItems.length) {
              expect(uniqueSignatures.size).toBe(signatures.length);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Property 35: Signed URLs have expiration timestamps
     * **Validates: Requirements 13.3**
     * **Feature: faculty-tools-course-management, Property 35: Signed URLs have expiration timestamps**
     */
    test('Property 35: Signed URLs have expiration timestamps', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }),
          fc.string({ minLength: 1, maxLength: 50 }),
          fc.integer({ min: 1, max: 168 }), // 1 to 168 hours (1 week)
          (contentId, userId, expirationHours) => {
            const result = signedUrlService.generateSignedUrl(contentId, userId, expirationHours);
            
            // Should have expiration timestamp
            expect(result.expiresAt).toBeInstanceOf(Date);
            
            // Expiration should be in the future
            expect(result.expiresAt.getTime()).toBeGreaterThan(Date.now());
            
            // Expiration should be approximately the requested duration from now
            const expectedExpiration = Date.now() + (expirationHours * 60 * 60 * 1000);
            const actualExpiration = result.expiresAt.getTime();
            
            // Allow 1 second tolerance for execution time
            expect(Math.abs(actualExpiration - expectedExpiration)).toBeLessThan(1000);
            
            // URL should contain expiration timestamp
            expect(result.url).toContain('expires=');
            expect(result.url).toContain(actualExpiration.toString());
          }
        ),
        { numRuns: 100 }
      );
    });

    test('Property: Signed URL verification is consistent', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }),
          fc.string({ minLength: 1, maxLength: 50 }),
          fc.integer({ min: 1, max: 24 }),
          (contentId, userId, expirationHours) => {
            const signedUrl = signedUrlService.generateSignedUrl(contentId, userId, expirationHours);
            
            // Verify the URL multiple times - should always return same result
            const verification1 = signedUrlService.verifySignedUrl(
              contentId,
              userId,
              signedUrl.expiresAt.getTime().toString(),
              signedUrl.signature
            );
            
            const verification2 = signedUrlService.verifySignedUrl(
              contentId,
              userId,
              signedUrl.expiresAt.getTime().toString(),
              signedUrl.signature
            );
            
            expect(verification1.isValid).toBe(verification2.isValid);
            expect(verification1.isExpired).toBe(verification2.isExpired);
            expect(verification1.error).toBe(verification2.error);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('Property: Signature verification is deterministic', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }),
          fc.string({ minLength: 1, maxLength: 50 }),
          fc.integer({ min: Date.now(), max: Date.now() + 86400000 }),
          (contentId, userId, expiresAt) => {
            const signature1 = signedUrlService.createSignature(contentId, userId, expiresAt);
            const signature2 = signedUrlService.createSignature(contentId, userId, expiresAt);
            
            // Same inputs should always produce same signature
            expect(signature1).toBe(signature2);
            
            // Signature should be a valid hex string
            expect(signature1).toMatch(/^[a-f0-9]+$/);
            expect(signature1.length).toBe(64); // SHA-256 produces 64 hex characters
          }
        ),
        { numRuns: 100 }
      );
    });

    test('Property: Different inputs produce different signatures', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }),
          fc.string({ minLength: 1, maxLength: 50 }),
          fc.string({ minLength: 1, maxLength: 50 }),
          fc.string({ minLength: 1, maxLength: 50 }),
          fc.integer({ min: Date.now(), max: Date.now() + 86400000 }),
          (contentId1, userId1, contentId2, userId2, expiresAt) => {
            // Skip if inputs are identical
            fc.pre(contentId1 !== contentId2 || userId1 !== userId2);
            
            const signature1 = signedUrlService.createSignature(contentId1, userId1, expiresAt);
            const signature2 = signedUrlService.createSignature(contentId2, userId2, expiresAt);
            
            // Different inputs should produce different signatures
            expect(signature1).not.toBe(signature2);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('Property: Batch URL generation produces valid URLs', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              contentId: fc.string({ minLength: 1, maxLength: 50 }),
              userId: fc.string({ minLength: 1, maxLength: 50 })
            }),
            { minLength: 1, maxLength: 5 }
          ),
          fc.integer({ min: 1, max: 48 }),
          (contentItems, expirationHours) => {
            const batchResults = signedUrlService.generateBatchSignedUrls(contentItems, expirationHours);
            
            expect(batchResults).toHaveLength(contentItems.length);
            
            batchResults.forEach((result, index) => {
              const item = contentItems[index];
              
              // Each result should have all required properties
              expect(result).toHaveProperty('url');
              expect(result).toHaveProperty('expiresAt');
              expect(result).toHaveProperty('signature');
              expect(result).toHaveProperty('contentId', item.contentId);
              expect(result).toHaveProperty('userId', item.userId);
              
              // Each URL should be valid
              expect(result.expiresAt.getTime()).toBeGreaterThan(Date.now());
              expect(result.url).toContain(item.contentId);
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});