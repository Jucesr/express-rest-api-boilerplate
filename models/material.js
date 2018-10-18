const addCrudOperations = require('./crud');

const ENTITY_NAME = 'Material';

module.exports = (sequelize, DataTypes) => {

  let Material = sequelize.define(ENTITY_NAME, {
    is_service: {
        type: DataTypes.BOOLEAN
    },
    code: {
      type: DataTypes.STRING(10),
      unique: true
    },
    description: {
      type: DataTypes.STRING(255)
    },
    uom: {
      type: DataTypes.STRING(20)
    },
    currency: {
      type: DataTypes.ENUM,
      values: ['MXN', 'USD']
    },
    base_cost: {
      type: DataTypes.DECIMAL(10,2)
    },
    other_cost: {
      type: DataTypes.DECIMAL(10,2)
    },
    waste_cost: {
      type: DataTypes.DECIMAL(10,2)
    },
    unit_rate: {
      type: DataTypes.DECIMAL(10,2)
    }
  }, { 
      tableName: ENTITY_NAME,
      underscored: true 
  });
  
  Material = addCrudOperations(Material, ENTITY_NAME);

  Material.associate = function (models) {
    Material.hasMany(models.material_quotation)
  }

  return Material;
}


