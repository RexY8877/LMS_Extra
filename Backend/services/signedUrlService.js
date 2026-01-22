const crypto = require('crypto');

/**
 * Service for generating and verifying signed URLs for secure file access
 */
class SignedUrlService {
  constructor() {
    // Use environment variable or generate a random secret for development
    this.secret = process.env.SIGNED_URL_SECRET || this.generateSecret();
    this.defaultExpirationHours = 24;
    
    if (!process.env.SIGNED_URL_SECRET) {
      console.warn('SIGNED_URL_SECRET not set. Using generated secret (not suitable for production)');
    }
  }

  /**
   * Generate a random secret for development
   * @returns {string}
   */
  generateSecret() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Generate a signed URL for file access
   * @param {string} contentId - Content identifier
   * @param {string} userId - User identifier
   * @param {number} expirationHours - Hours until expiration (default: 24)
   * @returns {Object} Signed URL data
   */
  generateSignedUrl(contentId, userId, expirationHours = this.defaultExpirationHours) {
    const expiresAt = Date.now() + (expirationHours * 60 * 60 * 1000);
    const signature = this.createSignature(contentId, userId, expiresAt);
    
    const signedUrl = `/api/content/${contentId}/download?expires=${expiresAt}&signature=${signature}&user=${userId}`;
    
    return {
      url: signedUrl,
      expiresAt: new Date(expiresAt),
      signature,
      contentId,
      userId
    };
  }

  /**
   * Create HMAC-SHA256 signature for URL
   * @param {string} contentId - Content identifier
   * @param {string} userId - User identifier
   * @param {number} expiresAt - Expiration timestamp
   * @returns {string} Hex-encoded signature
   */
  createSignature(contentId, userId, expiresAt) {
    const data = `${contentId}:${userId}:${expiresAt}`;
    return crypto
      .createHmac('sha256', this.secret)
      .update(data)
      .digest('hex');
  }

  /**
   * Verify a signed URL
   * @param {string} contentId - Content identifier
   * @param {string} userId - User identifier
   * @param {string} expiresAt - Expiration timestamp
   * @param {string} signature - URL signature
   * @returns {Object} Verification result
   */
  verifySignedUrl(contentId, userId, expiresAt, signature) {
    const result = {
      isValid: false,
      isExpired: false,
      error: null
    };

    try {
      // Check if URL has expired
      const expirationTime = parseInt(expiresAt);
      if (isNaN(expirationTime)) {
        result.error = 'Invalid expiration timestamp';
        return result;
      }

      if (Date.now() > expirationTime) {
        result.isExpired = true;
        result.error = 'URL has expired';
        return result;
      }

      // Verify signature
      const expectedSignature = this.createSignature(contentId, userId, expirationTime);
      
      // Use constant-time comparison to prevent timing attacks
      if (!this.constantTimeCompare(signature, expectedSignature)) {
        result.error = 'Invalid signature';
        return result;
      }

      result.isValid = true;
      return result;

    } catch (error) {
      result.error = `Verification failed: ${error.message}`;
      return result;
    }
  }

  /**
   * Constant-time string comparison to prevent timing attacks
   * @param {string} a - First string
   * @param {string} b - Second string
   * @returns {boolean} True if strings are equal
   */
  constantTimeCompare(a, b) {
    if (a.length !== b.length) {
      return false;
    }

    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }

    return result === 0;
  }

  /**
   * Generate a batch of signed URLs for multiple content items
   * @param {Array} contentItems - Array of {contentId, userId} objects
   * @param {number} expirationHours - Hours until expiration
   * @returns {Array} Array of signed URL objects
   */
  generateBatchSignedUrls(contentItems, expirationHours = this.defaultExpirationHours) {
    return contentItems.map(item => 
      this.generateSignedUrl(item.contentId, item.userId, expirationHours)
    );
  }

  /**
   * Create middleware for verifying signed URLs
   * @returns {Function} Express middleware function
   */
  createVerificationMiddleware() {
    return (req, res, next) => {
      const { contentId } = req.params;
      const { expires, signature, user } = req.query;

      if (!expires || !signature || !user) {
        return res.status(400).json({
          error: 'Missing required parameters: expires, signature, user'
        });
      }

      const verification = this.verifySignedUrl(contentId, user, expires, signature);

      if (!verification.isValid) {
        const statusCode = verification.isExpired ? 410 : 403;
        return res.status(statusCode).json({
          error: verification.error,
          expired: verification.isExpired
        });
      }

      // Add verified user to request for downstream handlers
      req.verifiedUser = user;
      req.urlExpiration = new Date(parseInt(expires));
      
      next();
    };
  }

  /**
   * Get URL expiration time in human-readable format
   * @param {number} expiresAt - Expiration timestamp
   * @returns {string} Human-readable expiration time
   */
  getExpirationString(expiresAt) {
    const expiration = new Date(expiresAt);
    const now = new Date();
    const diffMs = expiration.getTime() - now.getTime();
    
    if (diffMs <= 0) {
      return 'Expired';
    }

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHours > 0) {
      return `Expires in ${diffHours}h ${diffMinutes}m`;
    } else {
      return `Expires in ${diffMinutes}m`;
    }
  }

  /**
   * Revoke a signed URL by changing the secret (affects all URLs)
   * This is a nuclear option - use sparingly
   */
  revokeAllUrls() {
    this.secret = this.generateSecret();
    console.warn('All signed URLs have been revoked by secret rotation');
  }
}

// Singleton instance
let signedUrlService = null;

/**
 * Get singleton instance of signed URL service
 * @returns {SignedUrlService}
 */
function getSignedUrlService() {
  if (!signedUrlService) {
    signedUrlService = new SignedUrlService();
  }
  return signedUrlService;
}

module.exports = {
  SignedUrlService,
  getSignedUrlService
};