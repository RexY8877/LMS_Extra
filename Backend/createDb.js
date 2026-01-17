const { Client } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const createDb = async () => {
  const client = new Client({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    password: process.env.DB_PASSWORD || 'postgres',
    port: 5432,
    database: 'postgres', // Connect to default database
  });

  try {
    await client.connect();
    
    const dbName = process.env.DB_NAME || 'lmss';
    
    // Check if database exists
    const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [dbName]);
    
    if (res.rowCount === 0) {
      // Create database
      await client.query(`CREATE DATABASE "${dbName}"`);
      console.log(`Database "${dbName}" created successfully.`);
    } else {
      console.log(`Database "${dbName}" already exists.`);
    }
  } catch (err) {
    console.error('Error checking/creating database:', err.message);
    if (err.code === '28P01') {
      console.error('\n!!! AUTHENTICATION FAILED !!!');
      console.error('Please update the DB_PASSWORD in your .env file to your actual PostgreSQL password.');
    }
  } finally {
    await client.end();
  }
};

createDb();
