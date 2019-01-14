const addCrudOperations = require('./crud');
const errors = require('../config/errors');

const ENTITY_NAME = 'Material';

module.exports = (sequelize, DataTypes) => {
  const Op = sequelize.Op;

  let Material = sequelize.define(ENTITY_NAME, {
    parent_id: {
        type: DataTypes.INTEGER
    },
    is_item: {
        type: DataTypes.BOOLEAN
    },
    is_service: {
        type: DataTypes.BOOLEAN
    },
    code: {
      type: DataTypes.STRING(10)
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

  Material.findByCode = async (project_id, material_code) => {
    
    const item = await Material.findOne({
      where: {
        [Op.and]: [
          {code: material_code}, 
          {project_id: project_id}
        ]
    }})

    if(!item){
      return Promise.reject({
        isCustomError: true,
        body: errors.ENTITY_NOT_FOUND.replace('@ENTITY_NAME', ENTITY_NAME).replace('@ID', material_code)  
      })
    }

    return item

  }

  Material.associate = function (models) {
    Material.hasMany(models.material_quotation)
  }

  return Material;
}


