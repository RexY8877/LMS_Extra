const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const createDb = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/appdb', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(`✅ Connected to MongoDB database: ${mongoose.connection.name}`);
    console.log('MongoDB database is ready to use.');
    
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error connecting to MongoDB:', err.message);
    if (err.message.includes('ECONNREFUSED')) {
      console.error('\n!!! CONNECTION REFUSED !!!');
      console.error('Please make sure MongoDB is running.');
      console.error('Try running: docker compose up -d');
    }
  }
};

createDb();
