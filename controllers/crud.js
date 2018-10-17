const async_handler = require('express-async-handler')
const logService = require('../services/log.service')
const utils = require('../utils/utils')

const _create = (Model, fieldsToInclude) => {
    
  return async_handler (async (req, res, next) => {
    
    let new_entity = utils.validateRequiredFields(req.body, fieldsToInclude)

    let stored_entity = await Model._create(new_entity)
    
    res.send(stored_entity)

    logService.log(`An ${Model.getTableName()} was saved`)

  })
}


const _delete = (Model) => {

  return async_handler ( async (req, res, next) => {
    let id = req.params.id

    //  Search entity by ID
    let entity = await Model._delete(id)

    res.status(200).send(entity)
    logService.log(`${Model.getTableName()} was removed`)

  })
}

const _update = (Model, fieldsToInclude) => {

  return async_handler ( async (req, res, next) => {

    let id = req.params.id
    let new_entity = {}

    //  Prepare the new entity only with the fields that can be included
    for (let index = 0; index < fieldsToInclude.length; index++) {
            
        let field = fieldsToInclude[index]

        if (req.body.hasOwnProperty(field)) {
            new_entity[ field ] = req.body[ field ]
        }

    }

    let entity = await Model._update(id, new_entity)
    
    res.status(200).send(entity)
    logService.log(`${Model.getTableName()} was updated`)

  })
}

const _getAll = (Model) => {

  return async_handler ( async (req, res, next) => {
    
    let entities = await Model._findAll()

    res.send(entities)
    logService.log(`${Model.getTableName()} were sent`)

  })
}

const _getByID = (Model) => {

  return async_handler ( async (req, res, next) => {

    const id = req.params.id

    let entity = await Model._findById(id)
    
    res.status(200).send(entity)
    logService.log(`${Model.getTableName()} was sent`)
    
  })
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
      router.delete('/:id', action, _delete(Model))
    }else{
      router.delete('/:id', _delete(Model)) 
    }

    if(!!applyTo.update){
      router.patch('/:id', action, _update(Model, fields.toUpdate))
    }else{
      router.patch('/:id', _update(Model, fields.toUpdate)) 
    }

    if(!!applyTo.getByID){
      router.get('/:id', action, _getByID(Model))
    }else{
      router.get('/:id', _getByID(Model)) 
    }

    if(!!applyTo.getAll){
      router.get('/', action, _getAll(Model))
    }else{
      router.get('/', _getAll(Model)) 
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
