const express = require('express')
const async_handler = require('express-async-handler')
const error_handler = require('../middleware/error_handler')
const authenticate = require('../middleware/authenticate')
const addcrudRoutes = require('./crud')
const logService = require('../services/log.service')
let router = express.Router()

module.exports = (models) => {

    const Project = models.project;
    const Material = models.material;

    const fieldsToInclude = [
        'name',
        'code',
        'description',
        'status',
        'type',
        'currency',
        'uen',
        'picture_url'
    ]

    const fieldsToUpdate = [
        'name',
        'code',
        'description',
        'status',
        'type',
        'currency',
        'uen',
        'picture_url'
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
        logService.log(`Estimates of project ${id} were sent`)

    }))

    router.get('/:id/parameters', async_handler (async (req, res, next) => {
        const id = req.params.id

        let entities = await Project._getParameters(id)
        res.status(200).send(entities)
        logService.log(`Parameters of project ${id} were sent`)

    }))

    router.get('/:id/materials', async_handler (async (req, res, next) => {
        const id = req.params.id

        let entities = await Project._getMaterials(id)
        res.status(200).send(entities)
        logService.log(`Materials of project ${id} were sent`)

    }))

    router.get('/:id/materials/:code', async_handler (async (req, res, next) => {
        const project_id = req.params.id
        const material_code = req.params.code

        let item = await Material.findByCode(project_id, material_code)
        res.status(200).send(item)
        logService.log(`Material ${material_code} of project ${project_id} was sent`)

    }))
    
    router.use(error_handler('Project'))

    return router;
}
