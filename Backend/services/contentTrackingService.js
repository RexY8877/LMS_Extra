const Content = require('../models/Content');

/**
 * Content Access Tracking Service
 * Handles tracking of content views and downloads
 */
class ContentTrackingService {
  /**
   * Track content view
   * @param {string} contentId - Content ID
   * @param {string} userId - User ID who viewed the content
   * @returns {Promise<Object>} Updated content with new view count
   */
  async trackView(contentId, userId) {
    try {
      const content = await Content.findByIdAndUpdate(
        contentId,
        { 
          $inc: { viewCount: 1 },
          $set: { lastViewedAt: new Date() }
        },
        { new: true }
      );
      
      if (!content) {
        throw new Error('Content not found');
      }
      
      // Log the view for analytics (could be extended to store individual view records)
      console.log(`Content viewed: ${contentId} by user: ${userId} at ${new Date()}`);
      
      return {
        contentId: content._id,
        viewCount: content.viewCount,
        downloadCount: content.downloadCount,
        lastViewedAt: content.lastViewedAt
      };
      
    } catch (error) {
      console.error('Error tracking content view:', error);
      throw new Error(`Failed to track content view: ${error.message}`);
    }
  }
  
  /**
   * Track content download
   * @param {string} contentId - Content ID
   * @param {string} userId - User ID who downloaded the content
   * @returns {Promise<Object>} Updated content with new download count
   */
  async trackDownload(contentId, userId) {
    try {
      const content = await Content.findByIdAndUpdate(
        contentId,
        { 
          $inc: { downloadCount: 1 },
          $set: { lastDownloadedAt: new Date() }
        },
        { new: true }
      );
      
      if (!content) {
        throw new Error('Content not found');
      }
      
      // Log the download for analytics
      console.log(`Content downloaded: ${contentId} by user: ${userId} at ${new Date()}`);
      
      return {
        contentId: content._id,
        viewCount: content.viewCount,
        downloadCount: content.downloadCount,
        lastDownloadedAt: content.lastDownloadedAt
      };
      
    } catch (error) {
      console.error('Error tracking content download:', error);
      throw new Error(`Failed to track content download: ${error.message}`);
    }
  }
  
  /**
   * Get content access statistics
   * @param {string} contentId - Content ID
   * @returns {Promise<Object>} Content access statistics
   */
  async getAccessStats(contentId) {
    try {
      const content = await Content.findById(contentId)
        .select('viewCount downloadCount lastViewedAt lastDownloadedAt createdAt')
        .lean();
      
      if (!content) {
        throw new Error('Content not found');
      }
      
      return {
        contentId,
        viewCount: content.viewCount || 0,
        downloadCount: content.downloadCount || 0,
        lastViewedAt: content.lastViewedAt || null,
        lastDownloadedAt: content.lastDownloadedAt || null,
        createdAt: content.createdAt,
        totalAccess: (content.viewCount || 0) + (content.downloadCount || 0)
      };
      
    } catch (error) {
      console.error('Error getting content access stats:', error);
      throw new Error(`Failed to get content access stats: ${error.message}`);
    }
  }
  
  /**
   * Get access statistics for multiple content items
   * @param {string[]} contentIds - Array of content IDs
   * @returns {Promise<Object[]>} Array of content access statistics
   */
  async getBulkAccessStats(contentIds) {
    try {
      const contents = await Content.find({ _id: { $in: contentIds } })
        .select('viewCount downloadCount lastViewedAt lastDownloadedAt createdAt title type')
        .lean();
      
      return contents.map(content => ({
        contentId: content._id,
        title: content.title,
        type: content.type,
        viewCount: content.viewCount || 0,
        downloadCount: content.downloadCount || 0,
        lastViewedAt: content.lastViewedAt || null,
        lastDownloadedAt: content.lastDownloadedAt || null,
        createdAt: content.createdAt,
        totalAccess: (content.viewCount || 0) + (content.downloadCount || 0)
      }));
      
    } catch (error) {
      console.error('Error getting bulk content access stats:', error);
      throw new Error(`Failed to get bulk content access stats: ${error.message}`);
    }
  }
  
  /**
   * Get most viewed content
   * @param {number} limit - Number of items to return (default: 10)
   * @param {string} type - Content type filter (optional)
   * @returns {Promise<Object[]>} Most viewed content items
   */
  async getMostViewed(limit = 10, type = null) {
    try {
      const query = type ? { type } : {};
      
      const contents = await Content.find(query)
        .select('title type viewCount downloadCount createdAt')
        .sort({ viewCount: -1 })
        .limit(limit)
        .lean();
      
      return contents.map(content => ({
        contentId: content._id,
        title: content.title,
        type: content.type,
        viewCount: content.viewCount || 0,
        downloadCount: content.downloadCount || 0,
        createdAt: content.createdAt,
        totalAccess: (content.viewCount || 0) + (content.downloadCount || 0)
      }));
      
    } catch (error) {
      console.error('Error getting most viewed content:', error);
      throw new Error(`Failed to get most viewed content: ${error.message}`);
    }
  }
  
  /**
   * Reset access counters for content (admin function)
   * @param {string} contentId - Content ID
   * @returns {Promise<Object>} Reset confirmation
   */
  async resetAccessCounters(contentId) {
    try {
      const content = await Content.findByIdAndUpdate(
        contentId,
        { 
          viewCount: 0,
          downloadCount: 0,
          $unset: { 
            lastViewedAt: 1,
            lastDownloadedAt: 1 
          }
        },
        { new: true }
      );
      
      if (!content) {
        throw new Error('Content not found');
      }
      
      return {
        contentId: content._id,
        message: 'Access counters reset successfully',
        resetAt: new Date()
      };
      
    } catch (error) {
      console.error('Error resetting access counters:', error);
      throw new Error(`Failed to reset access counters: ${error.message}`);
    }
  }
}

module.exports = new ContentTrackingService();