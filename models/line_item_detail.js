const addCrudOperations = require('./crud');

const ENTITY_NAME = 'Line_Item_Detail';

module.exports = (sequelize, DataTypes) => {

  let Line_Item_Detail = sequelize.define(ENTITY_NAME, {
    is_assembly: {
			type: DataTypes.BOOLEAN
    },
    quantity: {
    	type: DataTypes.DECIMAL(10, 5),
    	defaultValue: 0    
    },
    formula: {
      type: DataTypes.STRING(255)
    }
    
  }, { 
      tableName: ENTITY_NAME,
      underscored: true 
  });
  
  Line_Item_Detail = addCrudOperations(Line_Item_Detail, ENTITY_NAME);

  Line_Item_Detail.associate = function (models) {
    
		Line_Item_Detail.belongsTo(models.material, 
			{
				foreignKey: {
          name: 'material_id',
          allowNull: true
        }
			}
		)

		Line_Item_Detail.belongsTo(models.line_item, 
			{
        foreignKey: {
          name: 'assembly_id',
          allowNull: true
        }
			}
		)
  }
	

  return Line_Item_Detail;
}


