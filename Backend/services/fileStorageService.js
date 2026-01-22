const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const AWS = require('aws-sdk');

/**
 * Abstract interface for file storage operations
 */
class FileStorageInterface {
  async uploadFile(file, options = {}) {
    throw new Error('uploadFile method must be implemented');
  }

  async getFile(fileKey) {
    throw new Error('getFile method must be implemented');
  }

  async deleteFile(fileKey) {
    throw new Error('deleteFile method must be implemented');
  }

  async generateSignedUrl(fileKey, expiresIn = 86400) {
    throw new Error('generateSignedUrl method must be implemented');
  }
}

/**
 * Local file storage implementation for development
 */
class LocalFileStorage extends FileStorageInterface {
  constructor(uploadDir = 'uploads') {
    super();
    this.uploadDir = path.resolve(uploadDir);
    this.ensureUploadDir();
  }

  async ensureUploadDir() {
    try {
      await fs.access(this.uploadDir);
    } catch (error) {
      await fs.mkdir(this.uploadDir, { recursive: true });
    }
  }

  async uploadFile(file, options = {}) {
    const { originalname, buffer, mimetype, size } = file;
    const fileExtension = path.extname(originalname);
    const uniqueFilename = `${uuidv4()}${fileExtension}`;
    const filePath = path.join(this.uploadDir, uniqueFilename);

    await fs.writeFile(filePath, buffer);

    return {
      fileKey: uniqueFilename,
      url: `/uploads/${uniqueFilename}`,
      size,
      mimetype,
      originalName: originalname
    };
  }

  async getFile(fileKey) {
    const filePath = path.join(this.uploadDir, fileKey);
    try {
      const buffer = await fs.readFile(filePath);
      return buffer;
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(`File not found: ${fileKey}`);
      }
      throw error;
    }
  }

  async deleteFile(fileKey) {
    const filePath = path.join(this.uploadDir, fileKey);
    try {
      await fs.unlink(filePath);
      return true;
    } catch (error) {
      if (error.code === 'ENOENT') {
        return false; // File already doesn't exist
      }
      throw error;
    }
  }

  async generateSignedUrl(fileKey, expiresIn = 86400) {
    // For local storage, return a simple URL
    // In production, this would be handled by the signed URL middleware
    return `/uploads/${fileKey}`;
  }
}

/**
 * AWS S3 file storage implementation for production
 */
class S3FileStorage extends FileStorageInterface {
  constructor(config = {}) {
    super();
    this.s3 = new AWS.S3({
      accessKeyId: config.accessKeyId || process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: config.secretAccessKey || process.env.AWS_SECRET_ACCESS_KEY,
      region: config.region || process.env.AWS_REGION || 'us-east-1'
    });
    this.bucket = config.bucket || process.env.AWS_S3_BUCKET;
    
    if (!this.bucket) {
      throw new Error('S3 bucket name is required');
    }
  }

  async uploadFile(file, options = {}) {
    const { originalname, buffer, mimetype, size } = file;
    const fileExtension = path.extname(originalname);
    const uniqueFilename = `${uuidv4()}${fileExtension}`;
    const fileKey = options.prefix ? `${options.prefix}/${uniqueFilename}` : uniqueFilename;

    const uploadParams = {
      Bucket: this.bucket,
      Key: fileKey,
      Body: buffer,
      ContentType: mimetype,
      ServerSideEncryption: 'AES256'
    };

    const result = await this.s3.upload(uploadParams).promise();

    return {
      fileKey,
      url: result.Location,
      size,
      mimetype,
      originalName: originalname
    };
  }

  async getFile(fileKey) {
    const params = {
      Bucket: this.bucket,
      Key: fileKey
    };

    try {
      const result = await this.s3.getObject(params).promise();
      return result.Body;
    } catch (error) {
      if (error.code === 'NoSuchKey') {
        throw new Error(`File not found: ${fileKey}`);
      }
      throw error;
    }
  }

  async deleteFile(fileKey) {
    const params = {
      Bucket: this.bucket,
      Key: fileKey
    };

    try {
      await this.s3.deleteObject(params).promise();
      return true;
    } catch (error) {
      if (error.code === 'NoSuchKey') {
        return false; // File already doesn't exist
      }
      throw error;
    }
  }

  async generateSignedUrl(fileKey, expiresIn = 86400) {
    const params = {
      Bucket: this.bucket,
      Key: fileKey,
      Expires: expiresIn
    };

    return this.s3.getSignedUrl('getObject', params);
  }
}

/**
 * Factory function to create appropriate storage instance based on environment
 */
function createFileStorage() {
  const environment = process.env.NODE_ENV || 'development';
  
  if (environment === 'production' && process.env.AWS_S3_BUCKET) {
    return new S3FileStorage();
  } else {
    return new LocalFileStorage();
  }
}

module.exports = {
  FileStorageInterface,
  LocalFileStorage,
  S3FileStorage,
  createFileStorage
};