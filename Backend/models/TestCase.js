const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const CodingProblem = require('./CodingProblem');

const TestCase = sequelize.define('TestCase', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  problemId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'CodingProblems',
      key: 'id',
    },
  },
  input: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  expectedOutput: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  isExample: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  weight: {
    type: DataTypes.FLOAT,
    defaultValue: 1.0,
  },
}, {
  timestamps: true,
});

TestCase.belongsTo(CodingProblem, { foreignKey: 'problemId', targetKey: 'id' });
CodingProblem.hasMany(TestCase, { foreignKey: 'problemId', sourceKey: 'id' });

module.exports = TestCase;
