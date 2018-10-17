const express = require('express');
const error_handler = require('../middleware/error_handler')
const authenticate = require('../middleware/authenticate')
const addcrudRoutes = require('./crud');
let router = express.Router()

module.exports = (Material) => {

    const fieldsToInclude = [
        'project_id',
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

    router.use(error_handler('Material'))

return router;
}