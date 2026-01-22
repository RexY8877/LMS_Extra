const fc = require('fast-check');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const contentTrackingService = require('./contentTrackingService');
const Content = require('../models/Content');
const User = require('../models/User');

describe('Content Tracking Service', () => {
  let mongoServer;
  let testContent;
  let testUser;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });})
