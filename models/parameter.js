const addCrudOperations = require('./crud');

const ENTITY_NAME = 'Parameter';

module.exports = (sequelize, DataTypes) => {

  let Parameter = sequelize.define(ENTITY_NAME, {
    code: {
      type: DataTypes.STRING(10),
      unique: true
    },
    description: {
      type: DataTypes.STRING(255)
    },
    value: {
      type: DataTypes.STRING
    }
  }, { 
      tableName: ENTITY_NAME,
      underscored: true 
  });
  
  Parameter = addCrudOperations(Parameter, ENTITY_NAME);

  return Parameter;
}


