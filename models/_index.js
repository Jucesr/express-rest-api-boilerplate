'use strict';
const dataTypes = require('sequelize');
const sequelize = require('../services/db.service');

//sequelize.drop();

//  The order of these entities matters. 
const files = [
  'user', 
  'project', 
  'estimate', 
  'parameter', 
  'line_item',
  'estimate_item', 
  'material',
  'line_item_detail',
  'material_quotation'
]

let models = {}

//  Load and create the models for each entity.
files.forEach(file => {
  models[file] = require(`./${file}`)(sequelize, dataTypes)
})

Object.keys(models).forEach(async function(modelName) {

  //  Execute assocation for adding FK
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }

  //  Add instance methods that require other model functions
  if (models[modelName].instanceMethods) {
    models[modelName].instanceMethods(models);
  }

  //  Create the tables
  // await models['estimate_item'].sync({force: true})
  //await models[modelName].sync({force: true})
});
debugger;
models.sequelize = sequelize;
models.dataTypes = dataTypes;

module.exports = models;