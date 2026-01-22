const fc = require('fast-check');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Import all the faculty models
const Batch = require('./Batch');
const Course = require('./Course');
const Module = require('./Module');
const Content = require('./Content');
const Assignment = require('./Assignment');
const Session = require('./Session');
const Announcement = require('./Announcement');

// Feature: faculty-tools-course-management, Property 8: Required fields are enforced for entity creation
// Validates: Requirements 3.1, 4.1, 4.3, 8.1, 12.1

describe('Faculty Models Required Field Validation', () => {
  let mongoServer;
  let mongoUri;

  beforeAll(async () => {
    // Start in-memory MongoDB instance
    mongoServer = await MongoMemoryServer.create();
    mongoUri = mongoServer.getUri();
    
    // Connect to the in-memory database
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    // Clean up
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // Clear all collections before each test
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  });

  /**
   * Property 8: Required fields are enforced for entity creation
   * For any entity creation (batch, course, module, assignment, session), 
   * the system should reject requests missing required fields.
   */
  test('Property 8: Batch creation enforces required fields', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          name: fc.option(fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0)),
          courseId: fc.option(fc.string().map(() => new mongoose.Types.ObjectId())),
          facultyId: fc.option(fc.string().map(() => new mongoose.Types.ObjectId())),
          startDate: fc.option(fc.date()),
          endDate: fc.option(fc.date()),
        }),
        async (batchData) => {
          // Remove undefined values to test missing fields
          const cleanData = Object.fromEntries(
            Object.entries(batchData).filter(([_, value]) => value !== null)
          );

          const requiredFields = ['name', 'courseId', 'facultyId', 'startDate', 'endDate'];
          const missingFields = requiredFields.filter(field => !(field in cleanData));
          
          // Check for empty strings after trim (Mongoose behavior)
          const hasEmptyStringFields = Object.entries(cleanData).some(([key, value]) => 
            ['name'].includes(key) && typeof value === 'string' && value.trim() === ''
          );

          if (missingFields.length > 0 || hasEmptyStringFields) {
            // Should reject when required fields are missing or empty after trim
            await expect(Batch.create(cleanData)).rejects.toThrow();
          } else {
            // Should succeed when all required fields are present and valid
            const batch = await Batch.create(cleanData);
            expect(batch).toBeDefined();
            expect(batch.name).toBe(cleanData.name.trim());
            expect(batch.courseId.toString()).toBe(cleanData.courseId.toString());
            expect(batch.facultyId.toString()).toBe(cleanData.facultyId.toString());
            expect(batch.startDate).toEqual(cleanData.startDate);
            expect(batch.endDate).toEqual(cleanData.endDate);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 8: Course creation enforces required fields', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          name: fc.option(fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0)),
          description: fc.option(fc.string({ minLength: 1, maxLength: 500 }).filter(s => s.trim().length > 0)),
          duration: fc.option(fc.integer({ min: 1, max: 52 })),
          difficulty: fc.option(fc.constantFrom('Beginner', 'Intermediate', 'Advanced')),
          facultyId: fc.option(fc.string().map(() => new mongoose.Types.ObjectId())),
        }),
        async (courseData) => {
          const cleanData = Object.fromEntries(
            Object.entries(courseData).filter(([_, value]) => value !== null)
          );

          const requiredFields = ['name', 'description', 'duration', 'difficulty', 'facultyId'];
          const missingFields = requiredFields.filter(field => !(field in cleanData));
          
          // Check for empty strings after trim
          const hasEmptyStringFields = Object.entries(cleanData).some(([key, value]) => 
            ['name', 'description'].includes(key) && typeof value === 'string' && value.trim() === ''
          );

          if (missingFields.length > 0 || hasEmptyStringFields) {
            await expect(Course.create(cleanData)).rejects.toThrow();
          } else {
            const course = await Course.create(cleanData);
            expect(course).toBeDefined();
            expect(course.name).toBe(cleanData.name.trim());
            expect(course.description).toBe(cleanData.description.trim());
            expect(course.duration).toBe(cleanData.duration);
            expect(course.difficulty).toBe(cleanData.difficulty);
            expect(course.facultyId.toString()).toBe(cleanData.facultyId.toString());
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 8: Module creation enforces required fields', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          courseId: fc.option(fc.string().map(() => new mongoose.Types.ObjectId())),
          name: fc.option(fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0)),
          description: fc.option(fc.string({ minLength: 1, maxLength: 500 }).filter(s => s.trim().length > 0)),
          sequence: fc.option(fc.integer({ min: 1, max: 100 })),
        }),
        async (moduleData) => {
          const cleanData = Object.fromEntries(
            Object.entries(moduleData).filter(([_, value]) => value !== null)
          );

          const requiredFields = ['courseId', 'name', 'description', 'sequence'];
          const missingFields = requiredFields.filter(field => !(field in cleanData));
          
          // Check for empty strings after trim
          const hasEmptyStringFields = Object.entries(cleanData).some(([key, value]) => 
            ['name', 'description'].includes(key) && typeof value === 'string' && value.trim() === ''
          );

          if (missingFields.length > 0 || hasEmptyStringFields) {
            await expect(Module.create(cleanData)).rejects.toThrow();
          } else {
            const module = await Module.create(cleanData);
            expect(module).toBeDefined();
            expect(module.courseId.toString()).toBe(cleanData.courseId.toString());
            expect(module.name).toBe(cleanData.name.trim());
            expect(module.description).toBe(cleanData.description.trim());
            expect(module.sequence).toBe(cleanData.sequence);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 8: Assignment creation enforces required fields', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          batchId: fc.option(fc.string().map(() => new mongoose.Types.ObjectId())),
          title: fc.option(fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0)),
          description: fc.option(fc.string({ minLength: 1, maxLength: 500 }).filter(s => s.trim().length > 0)),
          type: fc.option(fc.constantFrom('coding', 'written', 'file_upload')),
          dueDate: fc.option(fc.date()),
          totalPoints: fc.option(fc.integer({ min: 1, max: 100 })),
          createdBy: fc.option(fc.string().map(() => new mongoose.Types.ObjectId())),
        }),
        async (assignmentData) => {
          const cleanData = Object.fromEntries(
            Object.entries(assignmentData).filter(([_, value]) => value !== null)
          );

          const requiredFields = ['batchId', 'title', 'description', 'type', 'dueDate', 'totalPoints', 'createdBy'];
          const missingFields = requiredFields.filter(field => !(field in cleanData));
          
          // Check for empty strings after trim
          const hasEmptyStringFields = Object.entries(cleanData).some(([key, value]) => 
            ['title', 'description'].includes(key) && typeof value === 'string' && value.trim() === ''
          );

          if (missingFields.length > 0 || hasEmptyStringFields) {
            await expect(Assignment.create(cleanData)).rejects.toThrow();
          } else {
            const assignment = await Assignment.create(cleanData);
            expect(assignment).toBeDefined();
            expect(assignment.batchId.toString()).toBe(cleanData.batchId.toString());
            expect(assignment.title).toBe(cleanData.title.trim());
            expect(assignment.description).toBe(cleanData.description.trim());
            expect(assignment.type).toBe(cleanData.type);
            expect(assignment.dueDate).toEqual(cleanData.dueDate);
            expect(assignment.totalPoints).toBe(cleanData.totalPoints);
            expect(assignment.createdBy.toString()).toBe(cleanData.createdBy.toString());
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 8: Session creation enforces required fields', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          batchId: fc.option(fc.string().map(() => new mongoose.Types.ObjectId())),
          facultyId: fc.option(fc.string().map(() => new mongoose.Types.ObjectId())),
          title: fc.option(fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0)),
          date: fc.option(fc.date()),
          time: fc.option(fc.string({ minLength: 5, maxLength: 8 }).filter(s => s.trim().length >= 5)), // HH:MM format
          duration: fc.option(fc.integer({ min: 15, max: 240 })),
          meetingLink: fc.option(fc.webUrl()),
        }),
        async (sessionData) => {
          const cleanData = Object.fromEntries(
            Object.entries(sessionData).filter(([_, value]) => value !== null)
          );

          const requiredFields = ['batchId', 'facultyId', 'title', 'date', 'time', 'duration', 'meetingLink'];
          const missingFields = requiredFields.filter(field => !(field in cleanData));
          
          // Check for empty strings after trim
          const hasEmptyStringFields = Object.entries(cleanData).some(([key, value]) => 
            ['title', 'time'].includes(key) && typeof value === 'string' && value.trim() === ''
          );

          if (missingFields.length > 0 || hasEmptyStringFields) {
            await expect(Session.create(cleanData)).rejects.toThrow();
          } else {
            const session = await Session.create(cleanData);
            expect(session).toBeDefined();
            expect(session.batchId.toString()).toBe(cleanData.batchId.toString());
            expect(session.facultyId.toString()).toBe(cleanData.facultyId.toString());
            expect(session.title).toBe(cleanData.title.trim());
            expect(session.date).toEqual(cleanData.date);
            expect(session.time).toBe(cleanData.time);
            expect(session.duration).toBe(cleanData.duration);
            expect(session.meetingLink).toBe(cleanData.meetingLink);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 8: Announcement creation enforces required fields', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          facultyId: fc.option(fc.string().map(() => new mongoose.Types.ObjectId())),
          title: fc.option(fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0)),
          message: fc.option(fc.string({ minLength: 1, maxLength: 1000 }).filter(s => s.trim().length > 0)),
          targetType: fc.option(fc.constantFrom('batch', 'course', 'individual', 'all')),
          targetIds: fc.option(fc.array(fc.string().map(() => new mongoose.Types.ObjectId()), { minLength: 0, maxLength: 5 })),
        }),
        async (announcementData) => {
          const cleanData = Object.fromEntries(
            Object.entries(announcementData).filter(([_, value]) => value !== null)
          );

          const requiredFields = ['facultyId', 'title', 'message', 'targetType'];
          const missingFields = requiredFields.filter(field => !(field in cleanData));
          
          // Check for empty strings after trim
          const hasEmptyStringFields = Object.entries(cleanData).some(([key, value]) => 
            ['title', 'message'].includes(key) && typeof value === 'string' && value.trim() === ''
          );

          // targetIds is not strictly required as it defaults to empty array
          // but we need at least the other required fields
          if (missingFields.length > 0 || hasEmptyStringFields) {
            await expect(Announcement.create(cleanData)).rejects.toThrow();
          } else {
            const announcement = await Announcement.create(cleanData);
            expect(announcement).toBeDefined();
            expect(announcement.facultyId.toString()).toBe(cleanData.facultyId.toString());
            expect(announcement.title).toBe(cleanData.title.trim());
            expect(announcement.message).toBe(cleanData.message.trim());
            expect(announcement.targetType).toBe(cleanData.targetType);
            // targetIds defaults to empty array if not provided
            const expectedTargetIds = cleanData.targetIds || [];
            expect(announcement.targetIds.length).toBe(expectedTargetIds.length);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  // Additional unit tests for specific validation scenarios
  test('Batch model rejects invalid status values', async () => {
    const validBatchData = {
      name: 'Test Batch',
      courseId: new mongoose.Types.ObjectId(),
      facultyId: new mongoose.Types.ObjectId(),
      startDate: new Date(),
      endDate: new Date(Date.now() + 86400000), // tomorrow
      status: 'invalid_status'
    };

    await expect(Batch.create(validBatchData)).rejects.toThrow();
  });

  test('Course model rejects invalid difficulty values', async () => {
    const invalidCourseData = {
      name: 'Test Course',
      description: 'Test Description',
      duration: 12,
      difficulty: 'Invalid',
      facultyId: new mongoose.Types.ObjectId(),
    };

    await expect(Course.create(invalidCourseData)).rejects.toThrow();
  });

  test('Assignment model rejects invalid type values', async () => {
    const invalidAssignmentData = {
      batchId: new mongoose.Types.ObjectId(),
      title: 'Test Assignment',
      description: 'Test Description',
      type: 'invalid_type',
      dueDate: new Date(),
      totalPoints: 100,
      createdBy: new mongoose.Types.ObjectId(),
    };

    await expect(Assignment.create(invalidAssignmentData)).rejects.toThrow();
  });
});