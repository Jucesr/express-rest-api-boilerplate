const addCrudOperations = require('./crud');

const ENTITY_NAME = 'Material_Quotation';

module.exports = (sequelize, DataTypes) => {

  let Material_Quotation = sequelize.define(ENTITY_NAME, {
    date: {
      type: DataTypes.DATE
    },
    due_date: {
      type: DataTypes.DATE
    },
    unit_rate: {
      type: DataTypes.DECIMAL(10,2)
    },
    document_url: {
      type: DataTypes.STRING(255)
    }
  }, { 
      tableName: ENTITY_NAME,
      underscored: true 
  });
  
  Material_Quotation = addCrudOperations(Material_Quotation, ENTITY_NAME);

  return Material_Quotation;
}


