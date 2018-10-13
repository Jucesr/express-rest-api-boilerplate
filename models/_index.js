'use strict';
const dataTypes = require('sequelize');
const sequelize = require('../services/db.service');

const files = ['user', 'project', 'estimate', 'parameter', 'estimate_item'];

let models = {}

files.forEach(file => {
  models[file] = require(`./${file}`)(sequelize, dataTypes)
})

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