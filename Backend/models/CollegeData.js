const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const CollegeData = sequelize.define('CollegeData', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  collegeName: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  totalStudents: DataTypes.INTEGER,
  activeStudents: DataTypes.INTEGER,
  placementReady: DataTypes.INTEGER,
  averageScore: DataTypes.FLOAT,
  batchWiseData: {
    type: DataTypes.JSONB,
    defaultValue: [],
  },
  skillHeatmap: {
    type: DataTypes.JSONB,
    defaultValue: [],
  },
  highRiskStudents: {
    type: DataTypes.JSONB,
    defaultValue: [],
  },
}, {
  timestamps: true,
});

module.exports = CollegeData;
