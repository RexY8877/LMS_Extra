const fs = require('fs').promises;
const pdfParse = require('pdf-parse');
const path = require('path');

/**
 * PDF Processing Service
 * Handles PDF metadata extraction and processing
 */
class PDFProcessingService {
  /**
   * Extract metadata from PDF file
   * @param {string} filePath - Path to the PDF file
   * @returns {Promise<Object>} PDF metadata
   */
  async extractMetadata(filePath) {
    try {
      // Read the PDF file
      const dataBuffer = await fs.readFile(filePath);
      
      // Get file stats for size
      const stats = await fs.stat(filePath);
      const fileSizeBytes = stats.size;
      const fileSizeMB = (fileSizeBytes / (1024 * 1024)).toFixed(2);
      
      // Parse PDF to extract metadata
      const pdfData = await pdfParse(dataBuffer);
      
      const metadata = {
        pageCount: pdfData.numpages,
        fileSizeBytes: fileSizeBytes,
        fileSizeMB: parseFloat(fileSizeMB),
        textLength: pdfData.text ? pdfData.text.length : 0,
        title: pdfData.info?.Title || null,
        author: pdfData.info?.Author || null,
        subject: pdfData.info?.Subject || null,
        creator: pdfData.info?.Creator || null,
        producer: pdfData.info?.Producer || null,
        creationDate: pdfData.info?.CreationDate || null,
        modificationDate: pdfData.info?.ModDate || null,
        extractedAt: new Date()
      };
      
      return metadata;
      
    } catch (error) {
      console.error('PDF metadata extraction failed:', error);
      throw new Error(`Failed to extract PDF metadata: ${error.message}`);
    }
  }
  
  /**
   * Validate if file is a valid PDF
   * @param {string} filePath - Path to the file
   * @returns {Promise<boolean>} True if valid PDF
   */
  async isValidPDF(filePath) {
    try {
      const dataBuffer = await fs.readFile(filePath);
      
      // Check PDF header
      const header = dataBuffer.slice(0, 4).toString();
      if (header !== '%PDF') {
        return false;
      }
      
      // Try to parse the PDF
      await pdfParse(dataBuffer);
      return true;
      
    } catch (error) {
      console.error('PDF validation failed:', error);
      return false;
    }
  }
  
  /**
   * Extract text content from PDF (for search/indexing)
   * @param {string} filePath - Path to the PDF file
   * @param {number} maxLength - Maximum text length to extract (default: 10000)
   * @returns {Promise<string>} Extracted text content
   */
  async extractTextContent(filePath, maxLength = 10000) {
    try {
      const dataBuffer = await fs.readFile(filePath);
      const pdfData = await pdfParse(dataBuffer);
      
      let text = pdfData.text || '';
      
      // Truncate if too long
      if (text.length > maxLength) {
        text = text.substring(0, maxLength) + '...';
      }
      
      return text;
      
    } catch (error) {
      console.error('PDF text extraction failed:', error);
      throw new Error(`Failed to extract PDF text: ${error.message}`);
    }
  }
  
  /**
   * Get PDF processing summary
   * @param {string} filePath - Path to the PDF file
   * @returns {Promise<Object>} Processing summary
   */
  async getProcessingSummary(filePath) {
    try {
      const metadata = await this.extractMetadata(filePath);
      const isValid = await this.isValidPDF(filePath);
      
      return {
        isValid,
        metadata,
        processedAt: new Date(),
        status: isValid ? 'success' : 'failed'
      };
      
    } catch (error) {
      return {
        isValid: false,
        metadata: null,
        processedAt: new Date(),
        status: 'error',
        error: error.message
      };
    }
  }
}

module.exports = new PDFProcessingService();