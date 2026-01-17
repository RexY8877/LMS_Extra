const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const PlatformData = sequelize.define('PlatformData', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  totalColleges: DataTypes.INTEGER,
  totalStudents: DataTypes.INTEGER,
  totalFaculty: DataTypes.INTEGER,
  platformUsage: {
    type: DataTypes.JSONB,
    defaultValue: {},
  },
  collegeComparison: {
    type: DataTypes.JSONB,
    defaultValue: [],
  },
  growthMetrics: {
    type: DataTypes.JSONB,
    defaultValue: [],
  },
}, {
  timestamps: true,
});

module.exports = PlatformData;
