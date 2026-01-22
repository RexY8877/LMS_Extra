const { createFileStorage } = require('./fileStorageService');
const FileValidationService = require('./fileValidationService');
const { getMalwareScanService } = require('./malwareScanService');
const { getSignedUrlService } = require('./signedUrlService');

/**
 * Integrated file storage service that combines validation, scanning, storage, and URL generation
 */
class IntegratedFileStorageService {
  constructor() {
    this.storage = createFileStorage();
    this.validator = new FileValidationService();
    this.malwareScanner = getMalwareScanService();
    this.urlService = getSignedUrlService();
  }

  /**
   * Complete file upload workflow with validation, scanning, and storage
   * @param {Object} file - File object from multer
   * @param {string} userId - User uploading the file
   * @param {string} expectedType - Expected file type ('pdf' or 'video')
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Upload result
   */
  async uploadFile(file, userId, expectedType, options = {}) {
    try {
      // Step 1: Validate file
      const validation = this.validator.validateFile(file, expectedType);
      if (!validation.isValid) {
        throw new Error(`File validation failed: ${validation.errors.join(', ')}`);
      }

      // Step 2: Scan for malware
      const scanResult = await this.malwareScanner.scanBuffer(file.buffer, file.originalname);
      this.malwareScanner.validateScanResult(scanResult);

      // Step 3: Store file
      const storageResult = await this.storage.uploadFile(file, options);

      // Step 4: Generate signed URL
      const signedUrl = this.urlService.generateSignedUrl(storageResult.fileKey, userId);

      return {
        success: true,
        fileKey: storageResult.fileKey,
        originalName: validation.sanitizedFilename,
        size: storageResult.size,
        mimetype: storageResult.mimetype,
        signedUrl: signedUrl.url,
        expiresAt: signedUrl.expiresAt,
        scanResult: {
          isClean: scanResult.isClean,
          scanTime: scanResult.scanTime
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get secure access URL for a file
   * @param {string} fileKey - File key from storage
   * @param {string} userId - User requesting access
   * @param {number} expirationHours - Hours until expiration
   * @returns {Object} Signed URL data
   */
  getSecureUrl(fileKey, userId, expirationHours = 24) {
    return this.urlService.generateSignedUrl(fileKey, userId, expirationHours);
  }

  /**
   * Delete a file from storage
   * @param {string} fileKey - File key to delete
   * @returns {Promise<boolean>} Success status
   */
  async deleteFile(fileKey) {
    return await this.storage.deleteFile(fileKey);
  }

  /**
   * Get file validation rules for frontend
   * @param {string} fileType - File type category
   * @returns {Object} Validation rules
   */
  getValidationRules(fileType) {
    return {
      allowedTypes: this.validator.getAllowedTypes(fileType),
      maxSize: this.validator.getSizeLimit(fileType),
      maxSizeMB: Math.round(this.validator.getSizeLimit(fileType) / (1024 * 1024))
    };
  }
}

module.exports = IntegratedFileStorageService;