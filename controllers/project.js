const express = require('express')
const async_handler = require('express-async-handler')
const error_handler = require('../middleware/error_handler')
const authenticate = require('../middleware/authenticate')
const addcrudRoutes = require('./crud')
const logService = require('../services/log.service')
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

    router.get('/:id/estimates' , async_handler (async (req, res, next) => {
        const id = req.params.id

        let entities = await Project._getEstimates(id)
        res.status(200).send(entities)
        logService.log(`Estimates were sent`)

    }))

    router.get('/:id/parameters', async_handler (async (req, res, next) => {
        const id = req.params.id

        let entities = await Project._getParameters(id)
        res.status(200).send(entities)
        logService.log(`Parameters were sent`)

    }))
    
    router.use(error_handler('Project'))

    return router;
}
