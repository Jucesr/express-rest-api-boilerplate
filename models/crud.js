const errors = require('../config/errors');

module.exports = (Model, ENTITY_NAME) => {

    /**
     * @param {Object} entity - An object with all the required properties for Model
     */
  Model._create = function (entity){
    return this.create(entity)
  }
  
  /** Update an entity in the dabatase, first it will search and then save.
   * @param {string} id 
   * @param {Object} updated_entity 
   */
  Model._update = function (id, updated_entity) {
    
    return this.findById(id).then(
      entity => {
        if(!entity){
          return Promise.reject({
            isCustomError: 1,
            body: errors.ENTITY_NOT_FOUND.replace('@ENTITY_NAME', ENTITY_NAME)  
          })
        }
  
        Object.keys(updated_entity).map(property => {
          entity [property] = updated_entity[property]
        })
  
        return entity.save()
      }
    )
  }
  
  /** Delelte an entity in the dabatase, first it will search and then destroy it.
   * @param {string} id 
   */
  Model._delete = function (id) {
    
    return this.findById(id).then(
      entity => {
        if(!entity){
          return Promise.reject({
            isCustomError: 1,
            body: errors.ENTITY_NOT_FOUND.replace('@ENTITY_NAME', ENTITY_NAME)  
          })
        }
  
        return entity.destroy()
      }
    )
  }
  
  /** Serach an entity in the dabatase by ID.
   * @param {string} id 
   */
  Model._findById = function (id) {
    
    return this.findById(id).then(
      entity => {
        if(!entity){
          return Promise.reject({
            isCustomError: 1,
            body: errors.ENTITY_NOT_FOUND.replace('@ENTITY_NAME', ENTITY_NAME)  
          })
        }
  
        return entity
      }
    )
  }
  
  /** Get all entities in the dabatase.
   * @param {string} id 
   */
  Model._findAll = function (id) {
    return this.findAll(id)
  }
  
  /** Returns the name of the Model
   */
  Model._getName = function () { return ENTITY_NAME };


  return Model
}

