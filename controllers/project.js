const express = require('express');
const error_handler = require('../middleware/error_handler')
const authenticate = require('../middleware/authenticate')
const addcrudRoutes = require('./crud');
const logService = require('../services/log.service');
let router = express.Router()

module.exports = (Project) => {

    const fieldsToInclude = [
        'name',
        'code',
        'description',
        'status',
        'type',
        'currency',
        'uen'
    ]

    const fieldsToUpdate = [
        'name',
        'code',
        'description',
        'status',
        'type',
        'currency',
        'uen'
    ]

    router.use(authenticate)

    router = addcrudRoutes({
        model: Project,
        router,
        fields: {
            toAdd: fieldsToInclude,
            toUpdate: fieldsToUpdate
        }
    })

    //--------------------------------------------------------------------------------------
    //  Additional routes.
    //--------------------------------------------------------------------------------------

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
