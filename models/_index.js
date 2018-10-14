'use strict';
const dataTypes = require('sequelize');
const sequelize = require('../services/db.service');

//sequelize.drop();

//  The order of these entities matters. 
const files = ['user', 'project', 'estimate', 'parameter', 'line_item', 'estimate_item'];

let models = {}

//  Load and create the models for each entity.
files.forEach(file => {
  models[file] = require(`./${file}`)(sequelize, dataTypes)
})


// if(process.env.NODE_ENV == 'development'){
//   //  Drop all tables in rever order.
//   files.reverse().forEach(async file => {
//     await models[file].drop()
//   })
// }


//  Once all the tables have been dropped it can continue.

Object.keys(models).forEach(async function(modelName) {

  //  Execute assocation for adding FK
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }

  //  Create the tables
  await models[modelName].sync({force: true})
});



models.sequelize = sequelize;
models.dataTypes = dataTypes;

module.exports = models;