const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Check if we're in test environment
    const isTest = process.env.NODE_ENV === 'test';
    
    // MongoDB connection options
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };
    
    // Add production-specific options only if not in test
    if (!isTest) {
      Object.assign(options, {
        serverSelectionTimeoutMS: 10000, // Keep trying to send operations for 10 seconds
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        maxPoolSize: 10, // Maintain up to 10 socket connections
        minPoolSize: 2, // Maintain minimum 2 socket connections
        maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
        bufferMaxEntries: 0, // Disable mongoose buffering
        bufferCommands: false, // Disable mongoose buffering
        family: 4 // Use IPv4, skip trying IPv6
      });
    }

    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/lmss_db';
    
    if (!isTest) {
      console.log('🌐 Connecting to Network MongoDB...');
      console.log('📡 MongoDB URI:', mongoURI.replace(/\/\/.*@/, '//***:***@')); // Hide credentials in logs
    }
    
    const conn = await mongoose.connect(mongoURI, options);

    if (!isTest) {
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      console.log(`📁 Database: ${conn.connection.name}`);
      console.log(`🔌 Connection State: ${conn.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
    }
    
    // Handle connection events (only in non-test environments)
    if (!isTest) {
      mongoose.connection.on('error', (err) => {
        console.error('❌ MongoDB connection error:', err.message);
      });

      mongoose.connection.on('disconnected', () => {
        console.log('⚠️  MongoDB disconnected - attempting to reconnect...');
      });

      mongoose.connection.on('reconnected', () => {
        console.log('🔄 MongoDB reconnected successfully');
      });

      mongoose.connection.on('connecting', () => {
        console.log('🔄 MongoDB connecting...');
      });
    }

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      if (!isTest) console.log('🔒 MongoDB connection closed through app termination');
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      await mongoose.connection.close();
      if (!isTest) console.log('🔒 MongoDB connection closed through SIGTERM');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    
    if (error.name === 'MongoServerSelectionError') {
      console.error('\n🔧 Network MongoDB Troubleshooting:');
      console.error('1. Check if MongoDB server is running on the network');
      console.error('2. Verify the connection string in .env file');
      console.error('3. Check network connectivity to MongoDB server');
      console.error('4. Verify username/password credentials');
      console.error('5. Check if the database name exists');
      console.error('6. Ensure firewall allows connections on MongoDB port');
      console.error('7. Test with MongoDB Compass first');
    }
    
    if (error.name === 'MongoParseError') {
      console.error('\n🔧 Connection String Issues:');
      console.error('1. Check the format of MONGODB_URI in .env');
      console.error('2. Ensure special characters in password are URL-encoded');
      console.error('3. Example: mongodb://username:password@host:port/database');
    }
    
    console.error('\n📖 See MONGODB_SETUP_GUIDE.md for detailed troubleshooting');
    process.exit(1);
  }
};

module.exports = connectDB;
