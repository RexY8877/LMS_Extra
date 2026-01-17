const { Client } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

async function testConnection() {
  console.log('Testing PostgreSQL connection...');
  console.log(`User: ${process.env.DB_USER}`);
  console.log(`Host: ${process.env.DB_HOST}`);
  console.log(`Database: ${process.env.DB_NAME}`);
  console.log(`Password: **** (Length: ${process.env.DB_PASSWORD ? process.env.DB_PASSWORD.length : 0})`);

  const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: 5432,
  });

  try {
    await client.connect();
    console.log('✅ Connection successful!');
    const res = await client.query('SELECT NOW()');
    console.log('Database time:', res.rows[0].now);
    await client.end();
    process.exit(0);
  } catch (err) {
    console.error('❌ Connection failed:');
    if (err.code === '28P01') {
      console.error('   -> PASSWORD AUTHENTICATION FAILED.');
      console.error('   Please check DB_PASSWORD in your .env file.');
      console.error('   It must match the password you set when installing PostgreSQL.');
    } else if (err.code === '3D000') {
      console.error(`   -> DATABASE "${process.env.DB_NAME}" DOES NOT EXIST.`);
      console.error('   We will try to create it automatically with "npm run db:setup".');
    } else if (err.code === 'ECONNREFUSED') {
      console.error('   -> CONNECTION REFUSED.');
      console.error('   Is PostgreSQL running? Check your services/apps.');
    } else {
      console.error('   Error code:', err.code);
      console.error('   Message:', err.message);
    }
    await client.end();
    process.exit(1);
  }
}

testConnection();
