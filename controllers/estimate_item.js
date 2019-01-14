const express = require('express');
const error_handler = require('../middleware/error_handler')
const authenticate = require('../middleware/authenticate')
const addcrudRoutes = require('./crud');
let router = express.Router()

module.exports = (models) => {
    const EstimateItem = models.estimate_item
    
    const fieldsToInclude = [
        'project_id',
        'estimate_id',
        'line_item_id',
        'wbs_item_id',
        'parent_id',
        'is_disable',
        'description',
        'code',
        'quantity',
        'hierachy_level',
        'is_item',
        'indirect_percentage'
    ]

    const fieldsToUpdate = [
        'line_item_id',
        'wbs_item_id',
        'parent_id',
        'is_disable',
        'description',
        'code',
        'quantity',
        'hierachy_level',
        'is_item',
        'indirect_percentage'
    ]

    router.use(authenticate)

    router = addcrudRoutes({
        model: EstimateItem,
        router,
        fields: {
            toAdd: fieldsToInclude,
            toUpdate: fieldsToUpdate
        }
    })

    router.use(error_handler('EstimateItem'))

return router;
}