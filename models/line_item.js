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


  /** Get all the line item details as an array. It calculates unit rate in mxn and usd. 
   * @param {Object} id - The id of the line item
   * @returns {Array} - The array of line item details with unit rate.
   */
  LineItem._getDetails = function (id) {
    return this._findByIdAndDoAction(id, 
      entity => {
        return entity.getLine_Item_Details().then(details => {
          
          //  Check wheter it an assembly or material.
          let results = details.map(async detail => {
            let detail_json = detail.get();

            if(detail.is_assembly){
              //  Assembly
              //detail.getLine
              let assembly = await detail.getLine_Item()
              let assembly_total = await LineItem._getTotals(assembly.id)

              detail_json.code = assembly.code;
              detail_json.description = assembly.spanish_description;
              detail_json.uom = assembly.uom;
      
              detail_json.unit_rate_mxn = assembly_total.unit_rate_mxn;
              detail_json.unit_rate_usd = assembly_total.unit_rate_usd;
              

            }else{
              //  Material
              let material = await detail.getMaterial()

              detail_json.code = material.code;
              detail_json.description = material.description;
              detail_json.uom = material.uom;
              if(material.currency = 'MXN'){
                detail_json.unit_rate_mxn = material.unit_rate;
                detail_json.unit_rate_usd = 0;
              }else{
                detail_json.unit_rate_mxn = 0;
                detail_json.unit_rate_usd = material.unit_rate;
              }
              
            }
            return detail_json;
          })

        return Promise.all(results);
        })  
      }
    )
  }

  /** Get unit rate of the line item.  
   * @param {Object} id - The id of the line item
   * @returns {Object} - Object with 2 properties, unit rate in mxn and usd.
   */
  LineItem._getTotals = function (id) {
    
    return LineItem._getDetails(id).then(details => {
      let unit_rate_mxn = 0;
      let unit_rate_usd = 0;
      details.forEach(detail => {
        unit_rate_mxn += detail.quantity * detail.unit_rate_mxn;
        unit_rate_usd += detail.quantity * detail.unit_rate_usd;
      })
      
      return{
        unit_rate_mxn,
        unit_rate_usd
      }

    })
  }

  LineItem.associate = function (models) {
    LineItem.hasMany(models.line_item_detail, {foreignKey: 'line_item_id'});
    //LineItem.hasMany(models.BOM)
    //LineItem.belongsTo(models.wbs_item)
  }

  LineItem.instanceMethods = function (models) {

    LineItem.prototype.buildLineItemDetail = function (json) {
      
      const Line_Item_Detail = models.line_item_detail

      return Line_Item_Detail.build(json)

    }

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
          ...detail,
          entity_code,
          entity_id,
          unit_rate_mxn,
          unit_rate_usd
        }

        let details = await Promise.all(proms)

        return details

      })
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

        const detail_stored = await line_item.createLine_Item_Detail(detail)

        //  Calculate new unit rate.

        await line_item.calculateUnitRate()

        return detail_stored

      }
      
    }


    /** Calculate the unit rate of the line item based on Line item details (LIDs)
   * @param {Boolean} is_assembly - Tell whether is a line item   
   * @param {String} id - The code of the material/line item, it should be unique per project. 
   * @param {Number} code - The id of the material/lite item.
   * @param {Number} quantity  
   * @param {String} formula 
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
      debugger;
      let acum = urs.reduce((current, ur) => {
        current.urm += ur.unit_rate_mxn
        current.uru += ur.unit_rate_usd

        return current
      }, {urm: 0, uru: 0})

      line_item.unit_rate_mxn = acum.urm
      line_item.unit_rate_usd = acum.uru
      
      return line_item.save()
    }

  }// End of Instance methods

  return LineItem;
}


