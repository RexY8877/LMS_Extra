const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');

const StudentData = sequelize.define('StudentData', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  skillReadiness: DataTypes.INTEGER,
  codingProgress: DataTypes.INTEGER,
  softSkillsProgress: DataTypes.INTEGER,
  behavioralScore: DataTypes.INTEGER,
  upcomingAssessments: {
    type: DataTypes.JSONB, // Array of objects
    defaultValue: [],
  },
  recentActivities: {
    type: DataTypes.JSONB, // Array of objects
    defaultValue: [],
  },
  aiRecommendations: {
    type: DataTypes.JSONB, // Array of objects
    defaultValue: [],
  },
  skillBreakdown: {
    type: DataTypes.JSONB, // Array of objects
    defaultValue: [],
  },
  weeklyProgress: {
    type: DataTypes.JSONB, // Array of objects
    defaultValue: [],
  },
}, {
  timestamps: true,
});

StudentData.belongsTo(User, { foreignKey: 'userId', targetKey: 'id' });

module.exports = StudentData;
