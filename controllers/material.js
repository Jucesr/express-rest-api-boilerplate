const express = require('express');
const async_handler = require('express-async-handler')
const error_handler = require('../middleware/error_handler')
const authenticate = require('../middleware/authenticate')
const addcrudRoutes = require('./crud')
const logService = require('../services/log.service')
let router = express.Router()

module.exports = (models) => {

    const Material = models.material;

    const fieldsToInclude = [
        'project_id',
        'parent_id',
        'is_item',
        'is_service',
        'code',
        'description',
        'uom',
        'currency',
        'base_cost',
        'other_cost',
        'waste_cost',
        'unit_rate'
    ]

    const fieldsToUpdate = [
        'parent_id',
        'is_service',
        'code',
        'description',
        'uom',
        'currency',
        'base_cost',
        'other_cost',
        'waste_cost',
        'unit_rate'
    ]

    router.use(authenticate)

    router = addcrudRoutes({
        model: Material,
        router,
        fields: {
            toAdd: fieldsToInclude,
            toUpdate: fieldsToUpdate
        }
    })

    router.put('/:id/copyTo/:project_id', async_handler (async (req, res, next) => {
        const material_id = req.params.id
        const project_id = parseInt(req.params.project_id, 10)
    
        const material = await Material.findById(material_id)

        const new_material = await material.copyToAnotherProject(project_id)
        logService.log(`Materual ${material_id} was copy from project ${material.project_id} to project ${project_id}`)
        res.status(200).send(new_material)
        

    }))

    router.use(error_handler('Material'))

return router;
}