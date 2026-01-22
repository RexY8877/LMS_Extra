const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index');
const Content = require('../models/Content');
const ContentVersion = require('../models/ContentVersion');
const User = require('../models/User');
const fc = require('fast-check');

describe('Content Controller - Versioning', () => {
  let testUser;
  let authToken;

  beforeAll(async () => {
    // Create test user
    testUser = await User.create({
      name: 'Test Faculty',
      email: 'test@example.com',
      password: 'password123',
      role: 'faculty'
    });

    // Mock auth token for testing
    authToken = 'mock-jwt-token';
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Content.deleteMany({});
    await ContentVersion.deleteMany({});
  });

  beforeEach(async () => {
    await Content.deleteMany({});
    await ContentVersion.deleteMany({});
  });

  /**
   * Property 38: Content updates create new versions
   * Validates: Requirements 14.1
   */
  describe('Property 38: Content updates create new versions', () => {
    test('should create new versions when content file is updated', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            title: fc.string({ minLength: 1, maxLength: 100 }),
            description: fc.string({ minLength: 1, maxLength: 500 }),
            fileUrl: fc.webUrl(),
            fileName: fc.string({ minLength: 1, maxLength: 100 }),
            fileSize: fc.integer({ min: 1, max: 1000000 }),
            changeDescription: fc.string({ minLength: 1, maxLength: 200 })
          }),
          fc.record({
            newFileUrl: fc.webUrl(),
            newFileName: fc.string({ minLength: 1, maxLength: 100 }),
            newFileSize: fc.integer({ min: 1, max: 1000000 }),
            updateChangeDescription: fc.string({ minLength: 1, maxLength: 200 })
          }),
          async (initialData, updateData) => {
            // Create initial content
            const content = await Content.create({
              moduleId: new mongoose.Types.ObjectId(),
              type: 'pdf',
              title: initialData.title,
              description: initialData.description,
              fileUrl: initialData.fileUrl,
              fileName: initialData.fileName,
              fileSize: initialData.fileSize,
              createdBy: testUser._id,
              version: 1
            });

            const initialVersion = content.version;

            // Mock request object with user
            const mockReq = {
              params: { id: content._id.toString() },
              body: {
                fileUrl: updateData.newFileUrl,
                fileName: updateData.newFileName,
                fileSize: updateData.newFileSize,
                changeDescription: updateData.updateChangeDescription
              },
              user: { id: testUser._id.toString() }
            };

            const mockRes = {
              json: jest.fn(),
              status: jest.fn().mockReturnThis()
            };

            // Import and call the controller function
            const { updateContent } = require('./contentController');
            await updateContent(mockReq, mockRes);

            // Verify response was successful
            expect(mockRes.json).toHaveBeenCalledWith(
              expect.objectContaining({
                success: true,
                message: 'Content updated with new version'
              })
            );

            // Verify content version was incremented
            const updatedContent = await Content.findById(content._id);
            expect(updatedContent.version).toBe(initialVersion + 1);
            expect(updatedContent.fileUrl).toBe(updateData.newFileUrl);

            // Verify version records were created
            const versions = await ContentVersion.find({ contentId: content._id });
            expect(versions.length).toBe(2); // Original version + new version

            // Verify version data
            const oldVersion = versions.find(v => v.version === initialVersion);
            const newVersion = versions.find(v => v.version === initialVersion + 1);

            expect(oldVersion).toBeDefined();
            expect(oldVersion.fileUrl).toBe(initialData.fileUrl);
            expect(oldVersion.changeDescription).toBe(`Previous version ${initialVersion}`);

            expect(newVersion).toBeDefined();
            expect(newVersion.fileUrl).toBe(updateData.newFileUrl);
            expect(newVersion.changeDescription).toBe(updateData.updateChangeDescription);
          }
        ),
        { numRuns: 10 }
      );
    }, 30000);

    test('should not create new version for metadata-only updates', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            title: fc.string({ minLength: 1, maxLength: 100 }),
            description: fc.string({ minLength: 1, maxLength: 500 }),
            fileUrl: fc.webUrl(),
            fileName: fc.string({ minLength: 1, maxLength: 100 }),
            fileSize: fc.integer({ min: 1, max: 1000000 })
          }),
          fc.record({
            newTitle: fc.string({ minLength: 1, maxLength: 100 }),
            newDescription: fc.string({ minLength: 1, maxLength: 500 }),
            newTags: fc.array(fc.string({ minLength: 1, maxLength: 50 }), { maxLength: 5 }),
            newIsRequired: fc.boolean()
          }),
          async (initialData, updateData) => {
            // Create initial content
            const content = await Content.create({
              moduleId: new mongoose.Types.ObjectId(),
              type: 'pdf',
              title: initialData.title,
              description: initialData.description,
              fileUrl: initialData.fileUrl,
              fileName: initialData.fileName,
              fileSize: initialData.fileSize,
              createdBy: testUser._id,
              version: 1
            });

            const initialVersion = content.version;

            // Mock request object with user (metadata update only)
            const mockReq = {
              params: { id: content._id.toString() },
              body: {
                title: updateData.newTitle,
                description: updateData.newDescription,
                tags: updateData.newTags,
                isRequired: updateData.newIsRequired
                // No fileUrl - this is metadata-only update
              },
              user: { id: testUser._id.toString() }
            };

            const mockRes = {
              json: jest.fn(),
              status: jest.fn().mockReturnThis()
            };

            // Import and call the controller function
            const { updateContent } = require('./contentController');
            await updateContent(mockReq, mockRes);

            // Verify response was successful
            expect(mockRes.json).toHaveBeenCalledWith(
              expect.objectContaining({
                success: true,
                message: 'Content metadata updated successfully'
              })
            );

            // Verify content version was NOT incremented
            const updatedContent = await Content.findById(content._id);
            expect(updatedContent.version).toBe(initialVersion);
            expect(updatedContent.fileUrl).toBe(initialData.fileUrl); // File URL unchanged

            // Verify metadata was updated
            expect(updatedContent.title).toBe(updateData.newTitle);
            expect(updatedContent.description).toBe(updateData.newDescription);
            expect(updatedContent.tags).toEqual(updateData.newTags);
            expect(updatedContent.isRequired).toBe(updateData.newIsRequired);

            // Verify no version records were created
            const versions = await ContentVersion.find({ contentId: content._id });
            expect(versions.length).toBe(0);
          }
        ),
        { numRuns: 10 }
      );
    }, 30000);
  });
});