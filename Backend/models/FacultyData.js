const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');

const FacultyData = sequelize.define('FacultyData', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  pendingReviews: DataTypes.INTEGER,
  activeBatches: DataTypes.INTEGER,
  totalStudents: DataTypes.INTEGER,
  upcomingSessions: {
    type: DataTypes.JSONB,
    defaultValue: [],
  },
  recentSubmissions: {
    type: DataTypes.JSONB,
    defaultValue: [],
  },
  batchProgress: {
    type: DataTypes.JSONB,
    defaultValue: [],
  },
}, {
  timestamps: true,
});

FacultyData.belongsTo(User, { foreignKey: 'userId', targetKey: 'id' });

module.exports = FacultyData;
