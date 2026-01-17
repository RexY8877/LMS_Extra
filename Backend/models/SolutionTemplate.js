const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const CodingProblem = require('./CodingProblem');

const SolutionTemplate = sequelize.define('SolutionTemplate', {
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
  language: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  template: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  functionSignature: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  timestamps: true,
});

SolutionTemplate.belongsTo(CodingProblem, { foreignKey: 'problemId', targetKey: 'id' });
CodingProblem.hasMany(SolutionTemplate, { foreignKey: 'problemId', sourceKey: 'id' });

module.exports = SolutionTemplate;
