const addCrudOperations = require('./crud');

const ENTITY_NAME = 'Line_Item';

module.exports = (sequelize, DataTypes) => {

  let LineItem = sequelize.define(ENTITY_NAME, {
    code: {
      type: DataTypes.STRING(10),
      unique: true
    },
    spanish_description: {
      type: DataTypes.STRING(255)
    },
    english_description: {
      type: DataTypes.STRING(255)
    },
    uom: {
      type: DataTypes.STRING(20)
    }
  }, { 
      tableName: ENTITY_NAME,
      underscored: true 
  });
  
  LineItem = addCrudOperations(LineItem, ENTITY_NAME);

  LineItem.associate = function (models) {
    //LineItem.hasMany(models.estimate_item);
    //LineItem.hasMany(models.BOM)
    //LineItem.belongsTo(models.wbs_item)
  }

  return LineItem;
}


