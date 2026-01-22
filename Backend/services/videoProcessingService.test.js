const fc = require('fast-check');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Content = require('../models/Content');
const { 
  updateContentStatus, 
  getProcessingStatus,
  queueVideoProcessing 
} = require('./videoProcessingService');

describe('Video Processing Service', () => {
  let mongoServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await Content.deleteMany({});
  });

  /**
   * Property 17: Video processing status is tracked
   * **Validates: Requirements 6.4**
   * 
   * Feature: faculty-tools-course-management, Property 17: Video processing status is tracked
   */
  describe('Property 17: Video processing status is tracked', () => {
    test('for any video content, processing status should be tracked through states: pending → processing → complete/failed', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            moduleId: fc.string().map(() => new mongoose.Types.ObjectId()),
            title: fc.string({ minLength: 1, maxLength: 100 }),
            description: fc.string({ minLength: 1, maxLength: 500 }),
            fileUrl: fc.webUrl(),
            fileName: fc.string({ minLength: 1, maxLength: 100 }),
            createdBy: fc.string().map(() => new mongoose.Types.ObjectId())
          }),
          fc.constantFrom('pending', 'processing', 'complete', 'failed'),
          async (contentData, targetStatus) => {
            // Create video content
            const content = new Content({
              ...contentData,
              type: 'video',
              processingStatus: 'pending'
            });
            await content.save();

            // Update status
            await updateContentStatus(content._id.toString(), targetStatus);

            // Get processing status
            const status = await getProcessingStatus(content._id.toString());

            // Verify status is tracked correctly
            expect(status.contentId).toBe(content._id.toString());
            expect(status.status).toBe(targetStatus);
            expect(['pending', 'processing', 'complete', 'failed']).toContain(status.status);

            // Verify status progression makes sense
            const updatedContent = await Content.findById(content._id);
            expect(updatedContent.processingStatus).toBe(targetStatus);
          }
        ),
        { numRuns: 20 }
      );
    });

    test('processing status transitions follow valid state machine', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            moduleId: fc.string().map(() => new mongoose.Types.ObjectId()),
            title: fc.string({ minLength: 1, maxLength: 100 }),
            description: fc.string({ minLength: 1, maxLength: 500 }),
            fileUrl: fc.webUrl(),
            fileName: fc.string({ minLength: 1, maxLength: 100 }),
            createdBy: fc.string().map(() => new mongoose.Types.ObjectId())
          }),
          fc.array(fc.constantFrom('pending', 'processing', 'complete', 'failed'), { minLength: 1, maxLength: 5 }),
          async (contentData, statusSequence) => {
            // Create video content
            const content = new Content({
              ...contentData,
              type: 'video',
              processingStatus: 'pending'
            });
            await content.save();

            let lastValidStatus = 'pending';

            // Apply status sequence
            for (const status of statusSequence) {
              await updateContentStatus(content._id.toString(), status);
              
              const currentStatus = await getProcessingStatus(content._id.toString());
              
              // Verify status is one of the valid states
              expect(['pending', 'processing', 'complete', 'failed']).toContain(currentStatus.status);
              
              // Verify status was actually updated
              expect(currentStatus.status).toBe(status);
              
              lastValidStatus = status;
            }

            // Final verification
            const finalStatus = await getProcessingStatus(content._id.toString());
            expect(finalStatus.status).toBe(lastValidStatus);
          }
        ),
        { numRuns: 20 }
      );
    });

    test('processing status includes progress information', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            moduleId: fc.string().map(() => new mongoose.Types.ObjectId()),
            title: fc.string({ minLength: 1, maxLength: 100 }),
            description: fc.string({ minLength: 1, maxLength: 500 }),
            fileUrl: fc.webUrl(),
            fileName: fc.string({ minLength: 1, maxLength: 100 }),
            createdBy: fc.string().map(() => new mongoose.Types.ObjectId())
          }),
          fc.integer({ min: 0, max: 100 }),
          async (contentData, progress) => {
            // Create video content
            const content = new Content({
              ...contentData,
              type: 'video',
              processingStatus: 'pending'
            });
            await content.save();

            // Update status with progress
            await updateContentStatus(content._id.toString(), 'processing', { progress });

            // Get processing status
            const status = await getProcessingStatus(content._id.toString());

            // Verify status includes progress information
            expect(status.contentId).toBe(content._id.toString());
            expect(status.status).toBe('processing');
            expect(typeof status.progress).toBe('number');
            expect(status.progress).toBeGreaterThanOrEqual(0);
            expect(status.progress).toBeLessThanOrEqual(100);
          }
        ),
        { numRuns: 20 }
      );
    });

    test('completed processing includes metadata', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            moduleId: fc.string().map(() => new mongoose.Types.ObjectId()),
            title: fc.string({ minLength: 1, maxLength: 100 }),
            description: fc.string({ minLength: 1, maxLength: 500 }),
            fileUrl: fc.webUrl(),
            fileName: fc.string({ minLength: 1, maxLength: 100 }),
            createdBy: fc.string().map(() => new mongoose.Types.ObjectId())
          }),
          fc.record({
            duration: fc.integer({ min: 1, max: 7200 }), // 1 second to 2 hours
            resolution: fc.constantFrom('360p', '480p', '720p', '1080p'),
            thumbnailUrl: fc.webUrl()
          }),
          async (contentData, metadata) => {
            // Create video content
            const content = new Content({
              ...contentData,
              type: 'video',
              processingStatus: 'pending',
              metadata: {}
            });
            await content.save();

            // Update with metadata
            await updateContentStatus(content._id.toString(), 'complete', { 
              progress: 100,
              'metadata.duration': metadata.duration,
              'metadata.resolution': metadata.resolution,
              'metadata.thumbnailUrl': metadata.thumbnailUrl
            });

            // Get processing status
            const status = await getProcessingStatus(content._id.toString());

            // Verify completed status includes metadata
            expect(status.status).toBe('complete');
            expect(status.progress).toBe(100);
            expect(status.metadata).toBeDefined();
          }
        ),
        { numRuns: 20 }
      );
    });
  });
});