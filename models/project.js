const Sequelize = require('sequelize');
const sequelize = require('../services/db.service');
const addCrudOperations = require('./crud');

const ENTITY_NAME = 'Project';

let Project = sequelize.define(ENTITY_NAME, {
  name: {
    type: Sequelize.STRING(50)
  },
  code: {
    type: Sequelize.STRING(20),
    unique: true
  },
  description: {
    type: Sequelize.STRING(255)
  },
  status: {
    type: Sequelize.STRING(10)
  },
  type: {
    type: Sequelize.STRING(10)
  },
  currency: {
    type:   Sequelize.ENUM,
    values: ['MXN', 'USD']
  },
  uen: {
    type:   Sequelize.ENUM,
    values: ['MXL', 'MTY', 'TIJ', 'CDMX']
  }
}, { 
    tableName: ENTITY_NAME 
});


Project.prototype.toJSON = function () {
  const values = Object.assign({}, this.get());

  delete values.password;

  return values;
};

Project = addCrudOperations(Project, ENTITY_NAME);

//  Creates the table if it does not exits.
Project.sync();

module.exports = Project
