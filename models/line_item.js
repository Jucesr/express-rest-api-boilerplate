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
    },
    unit_rate_mxn: {
      type: DataTypes.VIRTUAL
    },
    unit_rate_usd: {
      type: DataTypes.VIRTUAL
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

  /**@override 
   * @param {Object} id - The id of the line item
   */
  LineItem._findById = function (id) {
    return LineItem._findByIdAndDoAction(id, (entity) => {

      return LineItem._getTotals(id).then(totals => {

        entity.unit_rate_mxn = totals.unit_rate_mxn
        entity.unit_rate_usd = totals.unit_rate_usd

        return entity
      })
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
  }

  return LineItem;
}


