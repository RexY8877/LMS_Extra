const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

async function testConnection() {
  console.log('Testing MongoDB connection...');
  console.log(`MongoDB URI: ${process.env.MONGODB_URI}`);

  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/appdb', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connection successful!');
    console.log(`Connected to: ${mongoose.connection.host}:${mongoose.connection.port}`);
    console.log(`Database: ${mongoose.connection.name}`);
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Connection failed:');
    if (err.message.includes('ECONNREFUSED')) {
      console.error('   -> CONNECTION REFUSED.');
      console.error('   Is MongoDB running? Check your services/apps.');
      console.error('   Try running: docker compose up -d');
    } else if (err.message.includes('Authentication failed')) {
      console.error('   -> AUTHENTICATION FAILED.');
      console.error('   Please check your MongoDB credentials in .env file.');
    } else {
      console.error('   Message:', err.message);
    }
    process.exit(1);
  }
}

testConnection();
