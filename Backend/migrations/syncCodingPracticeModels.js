const sequelize = require('../config/db');
const CodingProblem = require('../models/CodingProblem');
const TestCase = require('../models/TestCase');
const Submission = require('../models/Submission');
const SolutionTemplate = require('../models/SolutionTemplate');
const StudentProgress = require('../models/StudentProgress');

async function syncCodingPracticeModels() {
  try {
    console.log('Starting database synchronization for Coding Practice System...');
    
    // Sync models in order (respecting foreign key dependencies)
    await CodingProblem.sync({ alter: true });
    console.log('✓ CodingProblem model synced');
    
    await TestCase.sync({ alter: true });
    console.log('✓ TestCase model synced');
    
    await Submission.sync({ alter: true });
    console.log('✓ Submission model synced');
    
    await SolutionTemplate.sync({ alter: true });
    console.log('✓ SolutionTemplate model synced');
    
    await StudentProgress.sync({ alter: true });
    console.log('✓ StudentProgress model synced');
    
    console.log('Database synchronization completed successfully!');
  } catch (error) {
    console.error('Error syncing database models:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  syncCodingPracticeModels()
    .then(() => {
      console.log('Migration completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = syncCodingPracticeModels;
