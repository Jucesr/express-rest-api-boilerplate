const addCrudOperations = require('./crud');

const ENTITY_NAME = 'Estimate_Item';

module.exports = (sequelize, DataTypes) => {

  let EstimateItem = sequelize.define(ENTITY_NAME, {
    parent_id: {
      type: DataTypes.INTEGER
    },
    is_disable: {
      type: DataTypes.BOOLEAN
    },
    code: {
      type: DataTypes.STRING(40)
    },
    description: {
      type: DataTypes.STRING(255)
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
    },
    indirect_percentage: {
      type: DataTypes.DECIMAL(5,2)
    }
  }, { 
      tableName: ENTITY_NAME,
      underscored: true 
  });
  
  EstimateItem = addCrudOperations(EstimateItem, ENTITY_NAME);

  EstimateItem.associate = function (models) {

    EstimateItem.belongsTo(models.line_item, 
			{
				foreignKey: {
          name: 'line_item_id',
          allowNull: true
        }
			}
		)

    //EstimateItem.hasOne(models.estimate_item_qto)
    //EstimateItem.belongsTo(models.wbs_item)
  }

  return EstimateItem;
}


