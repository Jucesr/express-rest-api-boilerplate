'use strict';
const dataTypes = require('sequelize');
const sequelize = require('../services/db.service');

const user = require('./user')
const project = require('./project')
const estimate = require('./estimate')
const parameter = require('./parameter')

let models = {
    user: user(sequelize, dataTypes),
    project: project(sequelize, dataTypes),
    estimate: estimate(sequelize, dataTypes),
    parameter: parameter(sequelize, dataTypes)
}


Object.keys(models).forEach(function(modelName) {
  

  if (models[modelName].associate) {
    models[modelName].associate(models);
  }

  //  Create tables if they do not exits.
  models[modelName].sync({force: true})
});

models.sequelize = sequelize;
models.dataTypes = dataTypes;

module.exports = models;