const { exec } = require('child_process');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

console.log('🔍 Checking Network MongoDB Configuration...\n');

// Check MongoDB connection string
function checkConnectionString() {
  console.log('='.repeat(50));
  console.log('🌐 NETWORK MONGODB CONFIGURATION CHECK');
  console.log('='.repeat(50));
  console.log('');
  
  const mongoURI = process.env.MONGODB_URI;
  
  if (!mongoURI) {
    console.log('❌ MONGODB_URI not found in .env file');
    console.log('📝 Please add your MongoDB connection string to .env file');
    console.log('');
    console.log('Example:');
    console.log('MONGODB_URI=mongodb://username:password@host:27017/lmss_db?authSource=admin');
    return false;
  }
  
  console.log('✅ MONGODB_URI found in .env file');
  console.log('📡 Connection String:', mongoURI.replace(/\/\/.*@/, '//***:***@'));
  console.log('');
  
  // Parse connection string
  try {
    const url = new URL(mongoURI.replace('mongodb://', 'http://').replace('mongodb+srv://', 'https://'));
    console.log('📊 Connection Details:');
    console.log(`   Host: ${url.hostname}`);
    console.log(`   Port: ${url.port || (mongoURI.includes('mongodb+srv') ? '27017 (SRV)' : '27017')}`);
    console.log(`   Database: ${url.pathname.substring(1).split('?')[0]}`);
    console.log(`   Auth Source: ${url.searchParams.get('authSource') || 'Not specified'}`);
    console.log('');
    
    return true;
  } catch (error) {
    console.log('⚠️  Could not parse connection string format');
    console.log('🔧 Please verify the connection string format');
    console.log('');
    return true; // Still try to connect
  }
}

// Test network MongoDB connection
async function testNetworkConnection() {
  console.log('🔌 Testing Network MongoDB Connection...');
  console.log('-'.repeat(40));
  
  try {
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      console.log('❌ No connection string to test');
      return false;
    }
    
    // Connection options for network MongoDB
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // 10 seconds timeout
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      family: 4
    };
    
    console.log('⏳ Attempting connection (10 second timeout)...');
    
    const conn = await mongoose.connect(mongoURI, options);
    
    console.log('✅ Network MongoDB Connected Successfully!');
    console.log(`🏠 Host: ${conn.connection.host}`);
    console.log(`📁 Database: ${conn.connection.name}`);
    console.log(`🔌 Ready State: ${conn.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
    console.log('');
    
    // Test basic operations
    console.log('🧪 Testing Basic Operations...');
    const testCollection = conn.connection.db.collection('connection_test');
    
    // Test write
    await testCollection.insertOne({ 
      test: 'network_connection_test', 
      timestamp: new Date(),
      nodeVersion: process.version 
    });
    console.log('✅ Write operation successful');
    
    // Test read
    const doc = await testCollection.findOne({ test: 'network_connection_test' });
    console.log('✅ Read operation successful');
    
    // Clean up
    await testCollection.deleteOne({ test: 'network_connection_test' });
    console.log('✅ Delete operation successful');
    
    await mongoose.connection.close();
    console.log('');
    
    return true;
    
  } catch (error) {
    console.log('❌ Network MongoDB Connection Failed!');
    console.log(`🔥 Error: ${error.message}`);
    console.log('');
    
    if (error.name === 'MongoServerSelectionError') {
      console.log('🔧 Network Troubleshooting Tips:');
      console.log('1. Check if MongoDB server is running on the network');
      console.log('2. Verify the connection string in .env file');
      console.log('3. Check network connectivity to MongoDB server');
      console.log('4. Verify username/password credentials');
      console.log('5. Check if the database name exists');
      console.log('6. Ensure firewall allows connections on MongoDB port');
      console.log('7. Test with MongoDB Compass first');
      console.log('8. Check if VPN is required for network access');
    }
    
    if (error.name === 'MongoParseError') {
      console.log('🔧 Connection String Issues:');
      console.log('1. Check the format of MONGODB_URI in .env');
      console.log('2. Ensure special characters in password are URL-encoded');
      console.log('3. Example: mongodb://username:password@host:port/database');
    }
    
    if (error.code === 'ENOTFOUND') {
      console.log('🔧 DNS/Network Issues:');
      console.log('1. Check if the hostname is correct');
      console.log('2. Verify DNS resolution');
      console.log('3. Try using IP address instead of hostname');
      console.log('4. Check network connectivity');
    }
    
    console.log('');
    return false;
  }
}

// Main check function
async function checkNetworkMongoDB() {
  const hasConnectionString = checkConnectionString();
  
  if (!hasConnectionString) {
    console.log('💡 Next Steps:');
    console.log('1. Add your MongoDB connection string to Backend/.env');
    console.log('2. Run this check again: npm run db:check');
    console.log('3. See MONGODB_SETUP_GUIDE.md for detailed instructions');
    return;
  }
  
  const connectionWorks = await testNetworkConnection();
  
  console.log('='.repeat(50));
  console.log('📋 NETWORK MONGODB SUMMARY');
  console.log('='.repeat(50));
  console.log(`Configuration: ${hasConnectionString ? '✅' : '❌'}`);
  console.log(`Connection: ${connectionWorks ? '✅' : '❌'}`);
  console.log('');
  
  if (hasConnectionString && connectionWorks) {
    console.log('🎉 Network MongoDB is ready! You can now:');
    console.log('1. Setup demo data: npm run db:setup');
    console.log('2. Start the server: npm run dev');
    console.log('');
    console.log('🎯 Demo Credentials will be available after setup:');
    console.log('   Students: student1@demo.com to student5@demo.com');
    console.log('   Faculty: faculty1@demo.com to faculty4@demo.com');
    console.log('   Admins: admin@demo.com, super@demo.com');
    console.log('   Password: password123 (for all accounts)');
  } else {
    console.log('⚠️  Network MongoDB setup incomplete. Please:');
    if (!hasConnectionString) console.log('   - Add MongoDB connection string to .env');
    if (!connectionWorks) console.log('   - Fix connection issues (see troubleshooting above)');
    console.log('');
    console.log('📖 See MONGODB_SETUP_GUIDE.md for detailed instructions');
  }
  
  console.log('');
}

checkNetworkMongoDB();