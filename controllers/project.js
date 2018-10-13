const express = require('express');
const error_handler = require('../middleware/error_handler')
const authenticate = require('../middleware/authenticate')
const crudOperations = require('./crud');
const logService = require('../services/log.service');
const router = express.Router()

module.exports = (Project) => {
    router.post('/', authenticate, crudOperations._create(Project, [
        'name',
        'code',
        'description',
        'status',
        'type',
        'currency',
        'uen'
    ]))
    
    router.delete('/:id', authenticate, crudOperations._delete(Project))
    
    router.patch('/:id', authenticate, crudOperations._update(Project, [
        'name',
        'code',
        'description',
        'status',
        'type',
        'currency',
        'uen'
    ]))
    
    router.get('/:id', authenticate, crudOperations._getByID(Project))
    
    router.get('/', authenticate, crudOperations._getAll(Project))

    router.get('/:id/estimates', authenticate ,(req, res, next) => {
        const id = req.params.id
        Project._getEstimates(id).then(entities => {
            res.status(200).send(entities)
            logService.log(`Estimates were sent`)
        }).catch( e => next({
            code: !!e.isCustomError ? 0 : 1,
            body: !!e.isCustomError? e.body : e
        }) )
    })

    router.get('/:id/parameters', authenticate ,(req, res, next) => {
        const id = req.params.id
        Project._getParameters(id).then(entities => {
            res.status(200).send(entities)
            logService.log(`Parameters were sent`)
        }).catch( e => next({
            code: !!e.isCustomError ? 0 : 1,
            body: !!e.isCustomError? e.body : e
        }) )
    })
    
    router.use(error_handler('Project'))

    return router;
}
