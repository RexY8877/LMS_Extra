const mongoose = require('mongoose');
const path = require('path');

// Load test environment variables
require('dotenv').config({ path: path.join(__dirname, '.env.test') });

// Setup test database connection
beforeAll(async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/lmss_test_db';
  
  try {
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to test database');
  } catch (error) {
    console.error('Failed to connect to test database:', error);
    process.exit(1);
  }
});

// Clean up after all tests
afterAll(async () => {
  try {
    // Drop the test database
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
    console.log('Test database cleaned up');
  } catch (error) {
    console.error('Error cleaning up test database:', error);
  }
});