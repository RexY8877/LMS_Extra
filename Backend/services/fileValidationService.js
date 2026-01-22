const path = require('path');

/**
 * File validation service for uploaded content
 */
class FileValidationService {
  constructor() {
    // Allowed MIME types for different file categories
    this.allowedMimeTypes = {
      pdf: ['application/pdf'],
      video: [
        'video/mp4',
        'video/avi', 
        'video/x-msvideo',
        'video/quicktime'
      ]
    };

    // File size limits in bytes
    this.fileSizeLimits = {
      pdf: 50 * 1024 * 1024,    // 50MB
      video: 500 * 1024 * 1024  // 500MB
    };

    // Dangerous file extensions to reject
    this.dangerousExtensions = [
      '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js', '.jar',
      '.sh', '.php', '.asp', '.aspx', '.jsp', '.pl', '.py', '.rb'
    ];
  }

  /**
   * Validate file type, size, and security
   * @param {Object} file - File object with mimetype, size, originalname
   * @param {string} expectedType - Expected file type ('pdf' or 'video')
   * @returns {Object} Validation result
   */
  validateFile(file, expectedType) {
    const result = {
      isValid: true,
      errors: [],
      sanitizedFilename: this.sanitizeFilename(file.originalname)
    };

    // Validate file type
    const typeValidation = this.validateFileType(file.mimetype, expectedType);
    if (!typeValidation.isValid) {
      result.isValid = false;
      result.errors.push(...typeValidation.errors);
    }

    // Validate file size
    const sizeValidation = this.validateFileSize(file.size, expectedType);
    if (!sizeValidation.isValid) {
      result.isValid = false;
      result.errors.push(...sizeValidation.errors);
    }

    // Validate filename security
    const filenameValidation = this.validateFilename(file.originalname);
    if (!filenameValidation.isValid) {
      result.isValid = false;
      result.errors.push(...filenameValidation.errors);
    }

    return result;
  }

  /**
   * Validate file MIME type against allowed types
   * @param {string} mimetype - File MIME type
   * @param {string} expectedType - Expected file category
   * @returns {Object} Validation result
   */
  validateFileType(mimetype, expectedType) {
    const allowedTypes = this.allowedMimeTypes[expectedType];
    
    if (!allowedTypes) {
      return {
        isValid: false,
        errors: [`Unsupported file category: ${expectedType}`]
      };
    }

    if (!allowedTypes.includes(mimetype)) {
      return {
        isValid: false,
        errors: [
          `Invalid file type. Expected: ${allowedTypes.join(', ')}, got: ${mimetype}`
        ]
      };
    }

    return { isValid: true, errors: [] };
  }

  /**
   * Validate file size against limits
   * @param {number} fileSize - File size in bytes
   * @param {string} fileType - File category
   * @returns {Object} Validation result
   */
  validateFileSize(fileSize, fileType) {
    const maxSize = this.fileSizeLimits[fileType];
    
    if (!maxSize) {
      return {
        isValid: false,
        errors: [`No size limit defined for file type: ${fileType}`]
      };
    }

    if (fileSize > maxSize) {
      const maxSizeMB = Math.round(maxSize / (1024 * 1024));
      const fileSizeMB = Math.round(fileSize / (1024 * 1024));
      
      return {
        isValid: false,
        errors: [
          `File too large. Maximum size: ${maxSizeMB}MB, file size: ${fileSizeMB}MB`
        ]
      };
    }

    return { isValid: true, errors: [] };
  }

  /**
   * Validate filename for security issues
   * @param {string} filename - Original filename
   * @returns {Object} Validation result
   */
  validateFilename(filename) {
    const errors = [];

    // Check for dangerous extensions
    const extension = path.extname(filename).toLowerCase();
    if (this.dangerousExtensions.includes(extension)) {
      errors.push(`Dangerous file extension not allowed: ${extension}`);
    }

    // Check for path traversal attempts
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      errors.push('Filename contains invalid path characters');
    }

    // Check for null bytes
    if (filename.includes('\0')) {
      errors.push('Filename contains null bytes');
    }

    // Check filename length
    if (filename.length > 255) {
      errors.push('Filename too long (max 255 characters)');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Sanitize filename to prevent security issues
   * @param {string} filename - Original filename
   * @returns {string} Sanitized filename
   */
  sanitizeFilename(filename) {
    // Remove path separators and dangerous characters
    let sanitized = filename.replace(/[\/\\:*?"<>|]/g, '_');
    
    // Remove null bytes
    sanitized = sanitized.replace(/\0/g, '');
    
    // Remove leading/trailing dots and spaces
    sanitized = sanitized.replace(/^[.\s]+|[.\s]+$/g, '');
    
    // Ensure filename is not empty
    if (!sanitized) {
      sanitized = 'unnamed_file';
    }
    
    // Limit length
    if (sanitized.length > 255) {
      const extension = path.extname(sanitized);
      const basename = path.basename(sanitized, extension);
      sanitized = basename.substring(0, 255 - extension.length) + extension;
    }
    
    return sanitized;
  }

  /**
   * Get file category from MIME type
   * @param {string} mimetype - File MIME type
   * @returns {string|null} File category or null if not supported
   */
  getFileCategory(mimetype) {
    for (const [category, types] of Object.entries(this.allowedMimeTypes)) {
      if (types.includes(mimetype)) {
        return category;
      }
    }
    return null;
  }

  /**
   * Get allowed file types for a category
   * @param {string} category - File category
   * @returns {string[]} Array of allowed MIME types
   */
  getAllowedTypes(category) {
    return this.allowedMimeTypes[category] || [];
  }

  /**
   * Get file size limit for a category
   * @param {string} category - File category
   * @returns {number} Size limit in bytes
   */
  getSizeLimit(category) {
    return this.fileSizeLimits[category] || 0;
  }
}

module.exports = FileValidationService;