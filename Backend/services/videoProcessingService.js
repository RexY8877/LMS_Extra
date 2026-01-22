const { videoProcessingQueue, addVideoProcessingJob } = require('./videoProcessingQueue');
const { processVideo } = require('./videoTranscodingService');
const Content = require('../models/Content');
const path = require('path');
const fs = require('fs').promises;

/**
 * Initialize video processing worker
 */
const initializeVideoProcessor = () => {
  // Process video jobs
  videoProcessingQueue.process('process-video', async (job) => {
    const { contentId, filePath, metadata } = job.data;
    
    try {
      // Update status to processing
      await updateContentStatus(contentId, 'processing', { progress: 0 });
      
      // Create output directory
      const outputDir = path.join(path.dirname(filePath), `processed_${contentId}`);
      const baseUrl = `/api/content/${contentId}/stream`;
      
      // Process video with progress tracking
      const result = await processVideo(filePath, outputDir, baseUrl, async (progress) => {
        // Update job progress
        job.progress(progress.percent || 0);
        
        // Update content processing status
        await updateContentStatus(contentId, 'processing', {
          progress: progress.percent || 0,
          stage: progress.stage,
          currentResolution: progress.currentResolution
        });
      });
      
      // Update content with processing results
      await updateContentWithResults(contentId, result);
      
      // Update status to complete
      await updateContentStatus(contentId, 'complete', { 
        progress: 100,
        processedAt: new Date()
      });
      
      // Send notification (if notification service exists)
      await sendProcessingNotification(contentId, 'completed', result);
      
      return {
        success: true,
        contentId,
        result
      };
      
    } catch (error) {
      console.error(`Video processing failed for content ${contentId}:`, error);
      
      // Update status to failed
      await updateContentStatus(contentId, 'failed', {
        error: error.message,
        failedAt: new Date()
      });
      
      // Send failure notification
      await sendProcessingNotification(contentId, 'failed', { error: error.message });
      
      throw error;
    }
  });
  
  console.log('Video processing worker initialized');
};

/**
 * Queue video for processing
 */
const queueVideoProcessing = async (contentId, filePath, metadata = {}) => {
  try {
    // Update content status to pending
    await updateContentStatus(contentId, 'pending');
    
    // Add job to queue
    const job = await addVideoProcessingJob(contentId, filePath, metadata);
    
    return {
      jobId: job.id,
      contentId,
      status: 'queued'
    };
  } catch (error) {
    console.error('Error queuing video processing:', error);
    throw error;
  }
};

/**
 * Update content processing status
 */
const updateContentStatus = async (contentId, status, additionalData = {}) => {
  try {
    const updateData = {
      processingStatus: status,
      ...additionalData
    };
    
    await Content.findByIdAndUpdate(contentId, updateData);
    console.log(`Content ${contentId} status updated to ${status}`);
  } catch (error) {
    console.error(`Error updating content status for ${contentId}:`, error);
    throw error;
  }
};

/**
 * Update content with processing results
 */
const updateContentWithResults = async (contentId, result) => {
  try {
    const updateData = {
      'metadata.duration': result.metadata.duration,
      'metadata.resolution': result.resolutions.join(','),
      'metadata.thumbnailUrl': `/api/content/${contentId}/thumbnail`,
      fileSize: result.metadata.fileSize
    };
    
    await Content.findByIdAndUpdate(contentId, updateData);
    console.log(`Content ${contentId} updated with processing results`);
  } catch (error) {
    console.error(`Error updating content with results for ${contentId}:`, error);
    throw error;
  }
};

/**
 * Get processing status for content
 */
const getProcessingStatus = async (contentId) => {
  try {
    const content = await Content.findById(contentId).select('processingStatus metadata');
    
    if (!content) {
      throw new Error('Content not found');
    }
    
    // Get job status from queue if processing
    let jobStatus = null;
    if (content.processingStatus === 'processing') {
      // Find the job for this content (simplified - in production you'd store jobId)
      const activeJobs = await videoProcessingQueue.getActive();
      const job = activeJobs.find(j => j.data.contentId === contentId);
      
      if (job) {
        jobStatus = {
          progress: job.progress(),
          stage: job.data.stage || 'processing'
        };
      }
    }
    
    return {
      contentId,
      status: content.processingStatus,
      progress: jobStatus?.progress || (content.processingStatus === 'complete' ? 100 : 0),
      stage: jobStatus?.stage || content.processingStatus,
      metadata: content.metadata
    };
  } catch (error) {
    console.error(`Error getting processing status for ${contentId}:`, error);
    throw error;
  }
};

/**
 * Send processing notification
 */
const sendProcessingNotification = async (contentId, status, data) => {
  try {
    // Get content details
    const content = await Content.findById(contentId).populate('createdBy', 'email name');
    
    if (!content || !content.createdBy) {
      return;
    }
    
    const notification = {
      type: 'video_processing',
      contentId,
      contentTitle: content.title,
      status,
      timestamp: new Date(),
      data
    };
    
    // Here you would integrate with your notification service
    // For now, just log the notification
    console.log('Video processing notification:', notification);
    
    // TODO: Integrate with email service or in-app notifications
    // await emailService.sendNotification(content.createdBy.email, notification);
    // await notificationService.createNotification(content.createdBy._id, notification);
    
  } catch (error) {
    console.error('Error sending processing notification:', error);
    // Don't throw - notifications are not critical
  }
};

/**
 * Get processing statistics
 */
const getProcessingStats = async () => {
  try {
    const [queueStats, contentStats] = await Promise.all([
      require('./videoProcessingQueue').getQueueStats(),
      Content.aggregate([
        {
          $match: { type: 'video' }
        },
        {
          $group: {
            _id: '$processingStatus',
            count: { $sum: 1 }
          }
        }
      ])
    ]);
    
    const statusCounts = contentStats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {});
    
    return {
      queue: queueStats,
      content: {
        pending: statusCounts.pending || 0,
        processing: statusCounts.processing || 0,
        complete: statusCounts.complete || 0,
        failed: statusCounts.failed || 0
      }
    };
  } catch (error) {
    console.error('Error getting processing stats:', error);
    throw error;
  }
};

/**
 * Retry failed processing
 */
const retryProcessing = async (contentId) => {
  try {
    const content = await Content.findById(contentId);
    
    if (!content) {
      throw new Error('Content not found');
    }
    
    if (content.processingStatus !== 'failed') {
      throw new Error('Content is not in failed state');
    }
    
    // Re-queue for processing
    return await queueVideoProcessing(contentId, content.fileUrl);
  } catch (error) {
    console.error(`Error retrying processing for ${contentId}:`, error);
    throw error;
  }
};

module.exports = {
  initializeVideoProcessor,
  queueVideoProcessing,
  updateContentStatus,
  getProcessingStatus,
  getProcessingStats,
  retryProcessing,
  sendProcessingNotification
};