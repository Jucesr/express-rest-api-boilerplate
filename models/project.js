const addCrudOperations = require('./crud');

const ENTITY_NAME = 'Project';

module.exports = (sequelize, DataTypes) => {

  let Project = sequelize.define(ENTITY_NAME, {
    name: {
      type: DataTypes.STRING(50)
    },
    code: {
      type: DataTypes.STRING(20),
      unique: true
    },
    description: {
      type: DataTypes.STRING(255)
    },
    status: {
      type: DataTypes.STRING(10)
    },
    type: {
      type: DataTypes.STRING(10)
    },
    currency: {
      type:   DataTypes.ENUM,
      values: ['MXN', 'USD']
    },
    uen: {
      type:   DataTypes.ENUM,
      values: ['MXL', 'MTY', 'TIJ', 'CDMX']
    }
  }, { 
      tableName: ENTITY_NAME,
      underscored: true 
  });
  
  Project = addCrudOperations(Project, ENTITY_NAME);

  Project._getEstimates = function (id) {
    return this._findByIdAndDoAction(id, entity => entity.getEstimates())
  }

  Project._getParameters = function (id) {
    return this._findByIdAndDoAction(id, entity => entity.getParameters())
  }

  Project.associate = function (models) {
    Project.hasMany(models.estimate)
    Project.hasMany(models.parameter)
  }

  return Project;
}
