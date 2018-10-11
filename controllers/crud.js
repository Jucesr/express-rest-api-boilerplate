const logService = require('../services/log.service');

const _create = (Model, fieldsToInclude) => {

  return (req, res, next) => {

    let new_entity = {};

    //  Prepare the new entity with all the required fields
    for (let index = 0; index < fieldsToInclude.length; index++) {
        
        let field = fieldsToInclude[index]

        if (req.body.hasOwnProperty(field)) {
            new_entity[ field ] = req.body[ field ]
        }else{
            return next({
                code: 0,
                body: `Property ${field} is required.`
            })
        }

    }
    
    
    Model._create(new_entity).then( stored_entity => {
        res.send(stored_entity)
        logService.log(`An ${Model.getTableName()} was saved`, stored_entity)
    }).catch( e => next({
        code: !!e.isCustomError ? 0 : 1,
        body: !!e.isCustomError? e.body : e
    }) )

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
        

    }).catch( e => next({
        code: !!e.isCustomError ? 0 : 1,
        body: !!e.isCustomError? e.body : e
    }) )


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

    }).catch( e => next({
        code: !!e.isCustomError ? 0 : 1,
        body: !!e.isCustomError? e.body : e
    }) )

  }
}

const _getAll = (Model) => {

  return (req, res, next) => {
    
    Model._findAll().then(
      (entities) => {
        res.send(entities)
        logService.log(`${Model.getTableName()} were sent`)
    }).catch( e => next({
        code: 1,
        body: e
    }))
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

    }).catch( e => next({
        code: 1,
        body: e
    }))
  }
}

module.exports = {
    _create,
    _delete,
    _update,
    _getByID,
    _getAll
}
