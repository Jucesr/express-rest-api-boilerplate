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

  //  TODO: shoudl re calculate unit rate

  // LineItem._findById = function(id) {
  //   return LineItem._findByIdAndDoAction(id, (line_item) => {
  //     return line_item.calculateUnitRate()
  //   })
  // }

  LineItem.calculateUnitRate = function(id) {
    return LineItem._findByIdAndDoAction(id, (line_item) => {
      return line_item.calculateUnitRate()
    })
  }
  
  LineItem = addCrudOperations(LineItem, ENTITY_NAME);

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
        let entity_code, entity_id

        if(detail.is_assembly){
          let item = await detail.getLine_Item()

          entity_code = item.code
          entity_id = item.id

          unit_rate_mxn += item.unit_rate_mxn * detail.quantity
          unit_rate_usd += item.unit_rate_usd * detail.quantity

        }else{

          let material = await detail.getMaterial()

          entity_code = material.code
          entity_id = material.id

          if(material.currency == 'MXN'){
            unit_rate_mxn += material.unit_rate * detail.quantity
          }else{
            unit_rate_usd += material.unit_rate * detail.quantity
          }

        }

        return {
          ...detail.get(),
          entity_code,
          entity_id,
          unit_rate_mxn,
          unit_rate_usd
        }
      })

      let details = await Promise.all(proms)

      //  TODO: remove this block of code just to update Unit rate of items that were added after removing recursion calls
              await line_item.calculateUnitRate()

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

      if(line_item_detail){
        //  Validates if new fields are avaliable
        line_item_detail.material_id = detail.id
        line_item_detail.material_code = detail.code
        line_item_detail.is_assembly = detail.is_assembly
        line_item_detail.quantity = detail.quantity
        line_item_detail.formula = detail.formula


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



  }// End of Instance methods

  return LineItem;
}


