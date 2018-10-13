const addCrudOperations = require('./crud');

const ENTITY_NAME = 'Estimate_Item';

module.exports = (sequelize, DataTypes) => {

  let EstimateItem = sequelize.define(ENTITY_NAME, {
    is_disable: {
      type: DataTypes.BOOLEAN
    },
    description: {
      type: DataTypes.STRING(255)
    },
    code: {
      type: DataTypes.STRING(40),
      unique: true
    },
    quantity: {
      type: DataTypes.DECIMAL(10, 5),
      defaultValue: 0    
    },
    hierachy_level: {
      type: DataTypes.INTEGER
    },
    is_item: {
      type: DataTypes.BOOLEAN
    }
  }, { 
      tableName: ENTITY_NAME,
      underscored: true 
  });
  
  EstimateItem = addCrudOperations(EstimateItem, ENTITY_NAME);

  EstimateItem.associate = function (models) {
    //EstimateItem.hasOne(models.line_item)
    //EstimateItem.hasOne(models.estimate_item_qto)
    //EstimateItem.belongsTo(models.wbs_item)
  }

  return EstimateItem;
}


