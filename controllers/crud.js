const logService = require('../services/log.service')
const errors = require('../config/errors')
const utils = require('../utils/utils')

const _create = (Model, fieldsToInclude) => {
    
  return (req, res, next) => {

    
    let new_entity = {};

    try {
        new_entity = utils.validateRequiredFields(req.body, fieldsToInclude);    
    } catch (error) {
        return next(error);
    }
    
    Model._create(new_entity).then( stored_entity => {
        res.send(stored_entity)
        logService.log(`An ${Model.getTableName()} was saved`)
        
    }).catch( e => next(e))

  }
}

const _delete = (Model) => {

  return (req, res, next) => {
    let id = req.params.id

    //  Search entity by ID
    Model._delete(id).then( 
        (entity) => {
            res.status(200).send(entity)
            logService.log(`${Model.getTableName()} was removed`)
        

    }).catch( e => next(e))


  }
}

const _update = (Model, fieldsToInclude) => {

  return (req, res, next) => {

    let id = req.params.id
    let new_entity = {}

    //  Prepare the new entity only with the fields that can be included
    for (let index = 0; index < fieldsToInclude.length; index++) {
            
        let field = fieldsToInclude[index]

        if (req.body.hasOwnProperty(field)) {
            new_entity[ field ] = req.body[ field ]
        }

    }

    Model._update(id, new_entity).then( 
        (entity) => {
            res.status(200).send(entity)
            logService.log(`${Model.getTableName()} was updated`)

    }).catch( e => next(e))

  }
}

const _getAll = (Model) => {

  return (req, res, next) => {
    
    Model._findAll().then(
      (entities) => {
        res.send(entities)
        logService.log(`${Model.getTableName()} were sent`)
    }).catch( e => next(e))
  }
}

const _getByID = (Model) => {

  return (req, res, next) => {

    const id = req.params.id

    //  Search entity by ID
    Model._findById(id).then(
        entity => {              
            res.status(200).send(entity)
            logService.log(`${Model.getTableName()} was sent`)

    }).catch( e => next(e))
  }
}

module.exports = (options) => {
  //TODO:  Redo this function. Really ugly
  let {
    model: Model, 
    router, 
    fields
  } = options;

  if(options.hasOwnProperty('middleware')){
    let {applyTo, action} = options.middleware
    
    if(!!applyTo.create){
      router.post('/', action, _create(Model, fields.toAdd))
    }else{
      router.post('/', _create(Model, fields.toAdd)) 
    }

    if(!!applyTo.delete){
      router.post('/', action, _delete(Model, fields.toAdd))
    }else{
      router.post('/', _delete(Model, fields.toAdd)) 
    }

    if(!!applyTo.update){
      router.post('/', action, _update(Model, fields.toAdd))
    }else{
      router.post('/', _update(Model, fields.toAdd)) 
    }

    if(!!applyTo.getByID){
      router.post('/', action, _getByID(Model, fields.toAdd))
    }else{
      router.post('/', _getByID(Model, fields.toAdd)) 
    }

    if(!!applyTo.getAll){
      router.post('/', action, _getAll(Model, fields.toAdd))
    }else{
      router.post('/', _getAll(Model, fields.toAdd)) 
    }

  }else{
    router.post('/', _create(Model, fields.toAdd))

    router.delete('/:id', _delete(Model))

    router.patch('/:id', _update(Model, fields.toUpdate))

    router.get('/:id', _getByID(Model))

    router.get('/', _getAll(Model))
  }

  

  return router;
  
}
