const addCrudOperations = require('./crud');
const errors = require('../config/errors');

const ENTITY_NAME = 'Line_Item';

module.exports = (sequelize, DataTypes) => {
  const Op = sequelize.Op;

  let LineItem = sequelize.define(ENTITY_NAME, {
    code: {
      type: DataTypes.STRING(10)
    },
    spanish_description: {
      type: DataTypes.STRING(1500)
    },
    english_description: {
      type: DataTypes.STRING(1500)
    },
    uom: {
      type: DataTypes.STRING(20)
    },
    unit_rate_mxn: {
      type: DataTypes.DECIMAL(10,2),
      defaultValue: 0
    },
    unit_rate_usd: {
      type: DataTypes.DECIMAL(10,2),
      defaultValue: 0
      
    }
  }, { 
      tableName: ENTITY_NAME,
      underscored: true 
  });

  LineItem = addCrudOperations(LineItem, ENTITY_NAME);


  LineItem._findById = function(id) {
    return LineItem._findByIdAndDoAction(id, async (line_item) => {
      let line_item_details = await line_item.getLine_Item_Details()

      line_item_json = line_item.get()

      line_item_json.line_item_details = line_item_details.map(lid => lid.id)

      return line_item_json
    })
  }

  LineItem.calculateUnitRate = function(id) {
    return LineItem._findByIdAndDoAction(id, (line_item) => {
      return line_item.calculateUnitRate()
    })
  }

  LineItem.associate = function (models) {
    LineItem.hasMany(models.line_item_detail, {foreignKey: 'line_item_id'});
    //LineItem.hasMany(models.BOM)
    //LineItem.belongsTo(models.wbs_item)
  }

  LineItem.instanceMethods = function (models) {

    /** Get the details of a LI. 
   * @return {Array} An array of LIDs with unit rate, code and id   
   */
    LineItem.prototype.getDetails = async function () {
      let line_item = this
      let array_of_details = await line_item.getLine_Item_Details()

      let proms = await array_of_details.map(async detail => {
        let unit_rate_mxn = 0, unit_rate_usd = 0
        let entity_code, entity_id, description, uom, currency

        if(detail.is_assembly){
          let item = await detail.getLine_Item()

          entity_code = item.code
          entity_id = item.id
          description = item.spanish_description
          currency = 'MXN'
          uom = item.uom

          unit_rate_mxn += item.unit_rate_mxn 
          unit_rate_usd += item.unit_rate_usd

        }else{

          let material = await detail.getMaterial()

          entity_code = material.code
          entity_id = material.id
          description = material.description
          uom = material.uom
          currency = material.currency

          if(material.currency == 'MXN'){
            unit_rate_mxn += material.unit_rate
          }else{
            unit_rate_usd += material.unit_rate
          }

        }

        detail = detail.get()

        return {
          id: detail.id,
          is_assembly: detail.is_assembly,
          entity_id,
          entity_code,
          description,
          uom,
          quantity: detail.quantity,
          unit_rate_mxn,
          unit_rate_usd,
          currency
        }
      })

      let details = await Promise.all(proms)

      //  TODO: remove this block of code just to update Unit rate of items that were added after removing recursion calls
              //await line_item.calculateUnitRate()

      return details
    }

    /** Add an instance of LID. 
     * it will use the code of the detail. It needs to find it and get the ID to save it.
   * @param {Boolean} is_assembly - Tell whether is a line item   
   * @param {String} id - The code of the material/line item, it should be unique per project. 
   * @param {Number} code - The id of the material/lite item.
   * @param {Number} quantity  
   * @param {String} formula 
   */
    LineItem.prototype.addDetail = async function (detail) {
      let line_item = this;
        
      if(detail.is_assembly){
        //  The LID that is being added it's a line item.
        let item = await LineItem.findOne({
          where: {
            [Op.or]: [
              {code: detail.code}, 
              {id: detail.id}
            ]
            
          }
        })

        if(!item){
          //  Line item was not found
          return Promise.reject({
            isCustomError: true,
            body: errors.ENTITY_NOT_FOUND.replace('@ENTITY_NAME', ENTITY_NAME).replace('@ID', detail.assembly_code)  
          })
        }

        //  Line item was found
        detail.assembly_id = item.id
        detail.project_id = line_item.project_id
        delete detail.id

        const detail_stored = await line_item.createLine_Item_Detail(detail)
        
        //  Calculate new unit rate.

        await line_item.calculateUnitRate()

        return detail_stored

      }else{
        //  The LID that is being added it's a material.
        let material = await models.material.findOne({
          where: {
            [Op.or]: [
              {code: detail.code}, 
              {id: detail.id}
            ]
          }
        })

        if(!material){
          //  Material was not found
          return Promise.reject({
            isCustomError: true,
            body: errors.ENTITY_NOT_FOUND.replace('@ENTITY_NAME', 'MATERIAL').replace('@ID', detail.material_code)  
          })
        }

        //  Material was found
        detail.material_id = material.id
        detail.project_id = line_item.project_id
        delete detail.id

        const detail_stored = await line_item.createLine_Item_Detail(detail)

        //  Calculate new unit rate.

        await line_item.calculateUnitRate()

        return detail_stored

      }
      
    }

    /** Update a LID of the LI and then recalculate its UR 
   * @param {Number} id - The id of the LID
   * @param {Number} detail - The LID as an object  
   */
    LineItem.prototype.updateDetailByID = async function (id, detail) {
      const line_item = this;

      let array_of_details = await line_item.getLine_Item_Details()
      let line_item_detail ;

      for (let index = 0; index < array_of_details.length; index++) {
        const element = array_of_details[index];

        if(element.id == id){
          line_item_detail = element 
          break;
        }
      }

      //  TODO: Allow user to change code or ID.
      if(line_item_detail){

        if(detail.is_assembly){
          line_item_detail.quantity = detail.quantity
          line_item_detail.formula = detail.formula
        }else{
          //  Validates if new fields are avaliable
          line_item_detail.quantity = detail.quantity
          line_item_detail.formula = detail.formula
        }
        
        const new_detail = await line_item_detail.save()

        await line_item.calculateUnitRate()

        return new_detail
      }else{
        return Promise.reject({
          isCustomError: true,
          body: errors.ENTITY_NOT_FOUND.replace('@ENTITY_NAME', 'Line Item Detail').replace('@ID', id)    
        })
      }

    }

      /** Delete a LID of the LI and then recalculate its UR 
     * @param {Number} id - The id of the LID
     */
    LineItem.prototype.deleteDetailByID = async function (id) {
      const line_item = this;

      let array_of_details = await line_item.getLine_Item_Details()
      let line_item_detail ;

      for (let index = 0; index < array_of_details.length; index++) {
        const element = array_of_details[index];

        if(element.id == id){
          line_item_detail = element
          break;
        }
          
      }

      if(line_item_detail){

        await line_item.removeLine_Item_Detail(id)

        await line_item.calculateUnitRate()

        return line_item_detail
      }else{
        return Promise.reject({
          isCustomError: true,
          body: errors.ENTITY_NOT_FOUND.replace('@ENTITY_NAME', 'Line Item Detail').replace('@ID', id)    
        })
      }

    }
    

    /** Calculate the unit rate of the line item based on Line item details (LIDs)
   * @return {LineItem} new line item with the UR updated   
   */
    LineItem.prototype.calculateUnitRate = async function () {
      let line_item = this

      let array_of_details = await line_item.getLine_Item_Details()

      let proms = await array_of_details.map(async detail => {
        let unit_rate_mxn = 0, unit_rate_usd = 0

        if(detail.is_assembly){
          let item = await detail.getLine_Item()

          unit_rate_mxn += item.unit_rate_mxn * detail.quantity
          unit_rate_usd += item.unit_rate_usd * detail.quantity

        }else{

          let material = await detail.getMaterial()

          if(material.currency == 'MXN'){
            unit_rate_mxn += material.unit_rate * detail.quantity
          }else{
            unit_rate_usd += material.unit_rate * detail.quantity
          }

        }

        return {
          unit_rate_mxn,
          unit_rate_usd
        }

      })
      
      let urs = await Promise.all(proms)
      let acum = urs.reduce((current, ur) => {
        current.urm += ur.unit_rate_mxn
        current.uru += ur.unit_rate_usd

        return current
      }, {urm: 0, uru: 0})

      line_item.unit_rate_mxn = acum.urm
      line_item.unit_rate_usd = acum.uru

      let new_line_item = await line_item.save()

      //  Update UR of all the references in a recursion way

            //  Get all the LID where the LI is being used. 
            const LIDs = await line_item.getReferences()

            const proms2 = LIDs.map(lid => {
              return LineItem.calculateUnitRate(lid.line_item_id)
            })

            await Promise.all(proms2)

      //----------------------------------
      
      return new_line_item
    }

    /** Get all the references where the line item is being used in form of LID. 
   * @return {Array} array of LIDs.
   */
    LineItem.prototype.getReferences = async function () {
      let line_item = this;

      //  Get the references by searching in the LID table.
      let statement = `SELECT * FROM Line_Item_Detail where assembly_id = ${line_item.id}`

      let LIDs = await sequelize.query(statement)

      LIDs = LIDs[0]

      return LIDs
    }

    /** Copy a line item from one project to another.
     * It would create all the materials and sub line items need it.
     * 
     * @param {int} project_id - The ID of the project that the line item would be copy to. 
     * 
     */
    LineItem.prototype.copyToAnotherProject = async function (project_id) {
      let line_item = this;
      const Material = models.material

      const add_line_item = async function (line_item) {

        //  Check if the item already exists in the database.
        let already_exists = await LineItem.findOne({
          where: {
            [Op.and]: [
              {code: line_item.code}, 
              {project_id: project_id}
            ]
          }
        })

        if(already_exists){
          //  It's on the database no need to add it again.
          return already_exists
        }
          //  Call this method again to recursion.
          // const new_assembly = await add_line_item(li)
          // new_assembly_id = new_assembly.id
          // new_assembly_id = already_exists.id
        

        //  Add new line item
        let new_line_item = await LineItem.create({
          code: line_item.code,
          spanish_description: line_item.spanish_description,
          english_description: line_item.english_description,
          uom: line_item.uom,
          // unit_rate_mxn: line_item.unit_rate_mxn,
          // unit_rate_usd: line_item.unit_rate_usd,
          project_id: project_id
        }) 

        let new_assembly_id = null, new_material_id = null

        //  Get details of original line item so it can be added to the copy
        let array_of_details = await line_item.getLine_Item_Details()

        for (let index = 0; index < array_of_details.length; index++) {
          const detail = array_of_details[index];
          
          if(detail.is_assembly){
            //  Line item

            const li = await LineItem.findById(detail.assembly_id)
            //  Call this method again to recursion.
            const new_assembly = await add_line_item(li)
            new_assembly_id = new_assembly.id

          }else{
            //  Material
            let material = await Material.findById(detail.material_id)
            
            let already_exists = await Material.findOne({
              where: {
                [Op.and]: [
                  {code: material.code}, 
                  {project_id: project_id}
                ]
              }
            })
            
  
            if(!already_exists){
              //  it does not exist, create the material
              
              let new_material = await Material.create({
                is_service: material.is_service,
                code: material.code,
                description: material.description,
                uom: material.uom,
                currency: material.currency,
                base_cost: material.base_cost,
                other_cost: material.other_cost,
                waste_cost: material.waste_cost,
                unit_rate: material.unit_rate,
                project_id: project_id
              })

              new_material_id = new_material.id
            }else{
              new_material_id = already_exists.id
            }
  
          }

          //  Add the detail to the new line item.
          const new_detail = await new_line_item.createLine_Item_Detail({
            is_assembly: detail.is_assembly,
            quantity: detail.quantity,
            formula: detail.formula,
            project_id: project_id,
            material_id: new_material_id,
            assembly_id: new_assembly_id
          })
        }

        await new_line_item.calculateUnitRate()

        return new_line_item
      }

      return add_line_item(line_item)

    }



  }// End of Instance methods

  return LineItem;
}


