const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const CodingProblem = sequelize.define('CodingProblem', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  difficulty: {
    type: DataTypes.ENUM('Easy', 'Medium', 'Hard'),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  constraints: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
  },
  examples: {
    type: DataTypes.JSONB,
    defaultValue: [],
  },
  hints: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
  },
  companies: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
  },
  acceptance: DataTypes.FLOAT,
  timeLimit: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 2000,
  },
  memoryLimit: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 256,
  },
}, {
  timestamps: true,
});

module.exports = CodingProblem;
