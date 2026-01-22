const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database (optional for demo mode)
const DEMO_MODE = process.env.DEMO_MODE === 'true';

if (!DEMO_MODE) {
  connectDB();
} else {
  console.log('Running in DEMO MODE - MongoDB connection skipped');
}

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/demo', require('./routes/demoRoutes')); // Demo data routes (no MongoDB required)

// Enable faculty routes for non-demo mode
if (!DEMO_MODE) {
  app.use('/api/faculty', require('./routes/facultyRoutes'));
}

// Temporarily disabled routes that have dependency issues
// app.use('/api/student', require('./routes/studentRoutes'));
// app.use('/api/admin', require('./routes/adminRoutes'));
// app.use('/api/super-admin', require('./routes/superAdminRoutes'));
// app.use('/api/problems', require('./routes/problemRoutes'));
// app.use('/api/execute', require('./routes/executionRoutes'));
// app.use('/api/submissions', require('./routes/submissionRoutes'));

app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5000;

// Only start server if not in test environment
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
