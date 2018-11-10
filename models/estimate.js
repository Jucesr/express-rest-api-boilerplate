const addCrudOperations = require('./crud');

const ENTITY_NAME = 'Estimate';

module.exports = (sequelize, DataTypes) => {

  let Estimate = sequelize.define(ENTITY_NAME, {
    code: {
      type: DataTypes.STRING(10)
    },
    name: {
      type: DataTypes.STRING(50)
    },
    description: {
      type: DataTypes.STRING(255)
    },
    currency: {
      type: DataTypes.ENUM,
      values: ['MXN', 'USD']
    }
  }, { 
      tableName: ENTITY_NAME,
      underscored: true 
  });
  
  Estimate = addCrudOperations(Estimate, ENTITY_NAME);

  Estimate._findById = function(id) {
    return Estimate._findByIdAndDoAction(id, async (estimate) => {
      let estimate_items = await estimate.getEstimate_Items()

      estimate_json = estimate.get()

      estimate_json.estimate_items = estimate_items.map(ei => ei.id)

      return estimate_json
    })
  }

  Estimate._getEstimateItems = function (id) {
    return this._findByIdAndDoAction(id, entity => entity.getEstimate_Items())
  }

  Estimate.associate = function (models) {
    Estimate.hasMany(models.estimate_item)
  }

  return Estimate;
}


