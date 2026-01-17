const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');

const StudentProgress = sequelize.define('StudentProgress', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  totalSolved: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  easySolved: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  mediumSolved: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  hardSolved: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  totalSubmissions: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  acceptedSubmissions: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  acceptanceRate: {
    type: DataTypes.FLOAT,
    defaultValue: 0.0,
  },
  solvedByTopic: {
    type: DataTypes.JSONB,
    defaultValue: {},
  },
  dailyActivity: {
    type: DataTypes.JSONB,
    defaultValue: {},
  },
  streak: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  lastSolvedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  timestamps: true,
});

StudentProgress.belongsTo(User, { foreignKey: 'userId', targetKey: 'id' });
User.hasOne(StudentProgress, { foreignKey: 'userId', sourceKey: 'id' });

module.exports = StudentProgress;
