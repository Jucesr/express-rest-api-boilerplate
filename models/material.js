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

  Material.instanceMethods = function (models) {

    /** Copy a material from one project to another.
     * It would copy also all the dependencies of the material that is being copy (parents).
     * If the material already exists it will only returned. It will do the same for dependencies.
     * It uses the code to compare if the material already exists in the project that will be copy to.
     * 
     * @param {int} project_id - The ID of the project that the material would be copy to. 
     * 
     */
    Material.prototype.copyToAnotherProject = function (project_id){
      let material = this
      const Material = models.material

      const add_material = async function (material) {
        //  Check if the item already exists in the project that will be copy to.
        let already_exists = await Material.findOne({
          where: {
            [Op.and]: [
              {code: material.code}, 
              {project_id: project_id}
            ]
          }
        })

        if(already_exists){
          //  It's on the project no need to add it again.
          return already_exists
        }

        let new_parent_id = null
        //  Check if it has a parent_id
        if(material.parent_id != null){
          let parent_material = await Material.findById(material.parent_id)
          let new_parent_material = await add_material(parent_material)
          new_parent_id = new_parent_material.id
        }

        //  Add new material
        let new_material = await Material.create({
          project_id: project_id,
          parent_id: new_parent_id,
          is_item: material.is_item,
          is_service: material.is_service,
          code: material.code,
          description: material.description,
          uom: material.uom,
          currency: material.currency,
          base_cost: material.base_cost,
          other_cost: material.other_cost,
          waste_cost: material.waste_cost,
          unit_rate: material.unit_rate
        })
        
        return new_material
      }

      return add_material(material)
    }

  }

  return Material;
}


