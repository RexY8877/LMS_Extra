const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');
const CodingProblem = require('./CodingProblem');

const Submission = sequelize.define('Submission', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  problemId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'CodingProblems',
      key: 'id',
    },
  },
  code: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  language: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM(
      'Accepted',
      'Wrong Answer',
      'Time Limit Exceeded',
      'Memory Limit Exceeded',
      'Runtime Error',
      'Compilation Error'
    ),
    allowNull: false,
  },
  runtime: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  memory: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  runtimePercentile: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  memoryPercentile: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  testsPassed: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  totalTests: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  testResults: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
  },
}, {
  timestamps: true,
});

Submission.belongsTo(User, { foreignKey: 'userId', targetKey: 'id' });
Submission.belongsTo(CodingProblem, { foreignKey: 'problemId', targetKey: 'id' });
User.hasMany(Submission, { foreignKey: 'userId', sourceKey: 'id' });
CodingProblem.hasMany(Submission, { foreignKey: 'problemId', sourceKey: 'id' });

module.exports = Submission;
