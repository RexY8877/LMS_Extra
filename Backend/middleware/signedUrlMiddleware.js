const { getSignedUrlService } = require('../services/signedUrlService');

/**
 * Middleware to verify signed URLs for content access
 */
const verifySignedUrl = (req, res, next) => {
  const signedUrlService = getSignedUrlService();
  const middleware = signedUrlService.createVerificationMiddleware();
  return middleware(req, res, next);
};

module.exports = {
  verifySignedUrl
};