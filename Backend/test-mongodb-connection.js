const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const testConnection = async () => {
  try {
    console.log('Testing MongoDB Connection...');
    console.log('=================================');
    
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/lmss_db';
    console.log('MongoDB URI:', mongoURI.replace(/\/\/.*@/, '//***:***@')); // Hide credentials
    
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // 10 seconds timeout
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      family: 4
    };

    console.log('\nAttempting to connect...');
    const conn = await mongoose.connect(mongoURI, options);
    
    console.log('✅ MongoDB Connected Successfully!');
    console.log(`Host: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);
    console.log(`Port: ${conn.connection.port}`);
    console.log(`Ready State: ${conn.connection.readyState}`); // 1 = connected
    
    // Test basic operations
    console.log('\nTesting basic operations...');
    
    // List collections
    const collections = await conn.connection.db.listCollections().toArray();
    console.log(`Collections found: ${collections.length}`);
    collections.forEach(col => console.log(`  - ${col.name}`));
    
    // Test write operation
    const testCollection = conn.connection.db.collection('connection_test');
    const testDoc = { 
      message: 'Connection test successful', 
      timestamp: new Date(),
      nodeVersion: process.version
    };
    
    await testCollection.insertOne(testDoc);
    console.log('✅ Write operation successful');
    
    // Test read operation
    const retrievedDoc = await testCollection.findOne({ message: 'Connection test successful' });
    console.log('✅ Read operation successful');
    
    // Clean up test document
    await testCollection.deleteOne({ message: 'Connection test successful' });
    console.log('✅ Delete operation successful');
    
    console.log('\n🎉 All tests passed! Your MongoDB connection is working perfectly.');
    console.log('\nNext steps:');
    console.log('1. Run: npm run db:setup (to seed demo data)');
    console.log('2. Run: npm run dev (to start the server)');
    
  } catch (error) {
    console.error('❌ MongoDB Connection Failed!');
    console.error('Error:', error.message);
    
    if (error.name === 'MongoServerSelectionError') {
      console.error('\n🔧 Troubleshooting Tips:');
      console.error('1. Check if MongoDB server is running');
      console.error('2. Verify the connection string in .env file');
      console.error('3. Check network connectivity to MongoDB server');
      console.error('4. Verify username/password credentials');
      console.error('5. Check if the database name exists');
      console.error('6. Ensure firewall allows connections on MongoDB port');
    }
    
    if (error.name === 'MongoParseError') {
      console.error('\n🔧 Connection String Issues:');
      console.error('1. Check the format of MONGODB_URI in .env');
      console.error('2. Ensure special characters in password are URL-encoded');
      console.error('3. Example: mongodb://username:password@host:port/database');
    }
    
  } finally {
    await mongoose.connection.close();
    console.log('\nConnection closed.');
    process.exit();
  }
};

testConnection();