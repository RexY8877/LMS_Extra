const Queue = require('bull');
const redis = require('redis');

// Create Redis client
const redisClient = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  db: process.env.REDIS_DB || 0
});

// Handle Redis connection events
redisClient.on('connect', () => {
  console.log('Redis client connected for video processing queue');
});

redisClient.on('error', (err) => {
  console.error('Redis client error:', err);
});

// Create video processing queue
const videoProcessingQueue = new Queue('video processing', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    db: process.env.REDIS_DB || 0
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    },
    removeOnComplete: 10,
    removeOnFail: 5
  }
});

// Queue event handlers
videoProcessingQueue.on('completed', (job, result) => {
  console.log(`Video processing job ${job.id} completed:`, result);
});

videoProcessingQueue.on('failed', (job, err) => {
  console.error(`Video processing job ${job.id} failed:`, err.message);
});

videoProcessingQueue.on('stalled', (job) => {
  console.warn(`Video processing job ${job.id} stalled`);
});

// Add job to queue
const addVideoProcessingJob = async (contentId, filePath, metadata) => {
  try {
    const job = await videoProcessingQueue.add('process-video', {
      contentId,
      filePath,
      metadata,
      timestamp: new Date()
    }, {
      priority: metadata.priority || 0,
      delay: metadata.delay || 0
    });

    console.log(`Video processing job ${job.id} added to queue for content ${contentId}`);
    return job;
  } catch (error) {
    console.error('Error adding video processing job:', error);
    throw error;
  }
};

// Get job status
const getJobStatus = async (jobId) => {
  try {
    const job = await videoProcessingQueue.getJob(jobId);
    if (!job) {
      return null;
    }

    return {
      id: job.id,
      data: job.data,
      progress: job.progress(),
      state: await job.getState(),
      createdAt: job.timestamp,
      processedAt: job.processedOn,
      finishedAt: job.finishedOn,
      failedReason: job.failedReason
    };
  } catch (error) {
    console.error('Error getting job status:', error);
    throw error;
  }
};

// Get queue statistics
const getQueueStats = async () => {
  try {
    const waiting = await videoProcessingQueue.getWaiting();
    const active = await videoProcessingQueue.getActive();
    const completed = await videoProcessingQueue.getCompleted();
    const failed = await videoProcessingQueue.getFailed();

    return {
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
      total: waiting.length + active.length + completed.length + failed.length
    };
  } catch (error) {
    console.error('Error getting queue stats:', error);
    throw error;
  }
};

// Clean up old jobs
const cleanQueue = async () => {
  try {
    await videoProcessingQueue.clean(24 * 60 * 60 * 1000, 'completed'); // Remove completed jobs older than 24 hours
    await videoProcessingQueue.clean(7 * 24 * 60 * 60 * 1000, 'failed'); // Remove failed jobs older than 7 days
    console.log('Video processing queue cleaned');
  } catch (error) {
    console.error('Error cleaning queue:', error);
  }
};

// Graceful shutdown
const shutdown = async () => {
  try {
    await videoProcessingQueue.close();
    await redisClient.quit();
    console.log('Video processing queue shut down gracefully');
  } catch (error) {
    console.error('Error during queue shutdown:', error);
  }
};

module.exports = {
  videoProcessingQueue,
  addVideoProcessingJob,
  getJobStatus,
  getQueueStats,
  cleanQueue,
  shutdown
};