const Content = require('../models/Content');
const ContentVersion = require('../models/ContentVersion');
const { getProcessingStatus, getProcessingStats, retryProcessing } = require('../services/videoProcessingService');

/**
 * Prune old versions to maintain maximum of 10 versions per content
 * @param {string} contentId - The content ID
 */
const pruneOldVersions = async (contentId) => {
  try {
    const versions = await ContentVersion.find({ contentId })
      .sort({ version: -1 })
      .select('_id version');
    
    if (versions.length > 10) {
      // Keep the 10 most recent versions, delete the rest
      const versionsToDelete = versions.slice(10);
      const versionIdsToDelete = versionsToDelete.map(v => v._id);
      
      await ContentVersion.deleteMany({
        _id: { $in: versionIdsToDelete }
      });
      
      console.log(`Pruned ${versionsToDelete.length} old versions for content ${contentId}`);
    }
  } catch (error) {
    console.error('Error pruning old versions:', error);
    // Don't throw error as this is a cleanup operation
  }
};

/**
 * Get content processing status
 * GET /api/content/:id/status
 */
const getContentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    const status = await getProcessingStatus(id);
    
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Error getting content status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get content status',
      error: error.message
    });
  }
};

/**
 * Get processing statistics
 * GET /api/content/processing/stats
 */
const getProcessingStatistics = async (req, res) => {
  try {
    const stats = await getProcessingStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error getting processing statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get processing statistics',
      error: error.message
    });
  }
};

/**
 * Retry failed processing
 * POST /api/content/:id/retry
 */
const retryContentProcessing = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await retryProcessing(id);
    
    res.json({
      success: true,
      message: 'Processing retry initiated',
      data: result
    });
  } catch (error) {
    console.error('Error retrying content processing:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to retry processing',
      error: error.message
    });
  }
};

/**
 * Get content details
 * GET /api/content/:id
 */
const getContent = async (req, res) => {
  try {
    const { id } = req.params;
    
    const content = await Content.findById(id)
      .populate('moduleId', 'name courseId')
      .populate('createdBy', 'name email');
    
    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }
    
    res.json({
      success: true,
      data: content
    });
  } catch (error) {
    console.error('Error getting content:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get content',
      error: error.message
    });
  }
};

/**
 * Update content metadata and handle versioning
 * PUT /api/content/:id
 */
const updateContent = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, tags, isRequired, fileUrl, fileName, fileSize, changeDescription } = req.body;
    
    const content = await Content.findById(id);
    
    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }
    
    // Check if this is a file update (new version)
    const isFileUpdate = fileUrl && fileUrl !== content.fileUrl;
    
    if (isFileUpdate) {
      // File update requires change description
      if (!changeDescription || changeDescription.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Change description is required for file updates'
        });
      }
      
      // Create version record for current content before updating
      const versionData = {
        contentId: content._id,
        version: content.version,
        fileUrl: content.fileUrl,
        fileName: content.fileName,
        fileSize: content.fileSize,
        changeDescription: `Previous version ${content.version}`,
        createdBy: req.user.id,
        metadata: content.metadata
      };
      
      await ContentVersion.create(versionData);
      
      // Increment version number and update file info
      const updateData = {
        version: content.version + 1,
        fileUrl,
        fileName: fileName || content.fileName,
        fileSize: fileSize || content.fileSize,
        processingStatus: 'pending' // Reset processing status for new file
      };
      
      // Update other metadata if provided
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (tags !== undefined) updateData.tags = tags;
      if (isRequired !== undefined) updateData.isRequired = isRequired;
      
      const updatedContent = await Content.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );
      
      // Create version record for the new version
      const newVersionData = {
        contentId: content._id,
        version: updatedContent.version,
        fileUrl: updatedContent.fileUrl,
        fileName: updatedContent.fileName,
        fileSize: updatedContent.fileSize,
        changeDescription,
        createdBy: req.user.id,
        metadata: updatedContent.metadata
      };
      
      await ContentVersion.create(newVersionData);
      
      // Prune old versions to maintain limit of 10
      await pruneOldVersions(content._id);
      
      res.json({
        success: true,
        message: 'Content updated with new version',
        data: updatedContent
      });
    } else {
      // Metadata-only update (no new version)
      const updateData = {};
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (tags !== undefined) updateData.tags = tags;
      if (isRequired !== undefined) updateData.isRequired = isRequired;
      
      const updatedContent = await Content.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );
      
      res.json({
        success: true,
        message: 'Content metadata updated successfully',
        data: updatedContent
      });
    }
  } catch (error) {
    console.error('Error updating content:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update content',
      error: error.message
    });
  }
};

/**
 * Delete content (soft delete)
 * DELETE /api/content/:id
 */
const deleteContent = async (req, res) => {
  try {
    const { id } = req.params;
    
    const content = await Content.findById(id);
    
    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }
    
    // Soft delete by updating status
    await Content.findByIdAndUpdate(id, {
      processingStatus: 'deleted',
      deletedAt: new Date()
    });
    
    res.json({
      success: true,
      message: 'Content deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting content:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete content',
      error: error.message
    });
  }
};

module.exports = {
  getContentStatus,
  getProcessingStatistics,
  retryContentProcessing,
  getContent,
  updateContent,
  deleteContent
};