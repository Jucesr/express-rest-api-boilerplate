const express = require('express');
const error_handler = require('../middleware/error_handler')
const authenticate = require('../middleware/authenticate')
const crudOperations = require('./crud');
const router = express.Router()

module.exports = (EstimateItem) => {
    router.post('/', authenticate, crudOperations._create(EstimateItem, [
        'project_id',
        'estimate_id',
        'line_item_id',
        'wbs_item_id',
        'is_disable',
        'description',
        'code',
        'quantity',
        'hierachy_level',
        'is_item'
    ]))

    router.delete('/:id', authenticate, crudOperations._delete(EstimateItem))

    router.patch('/:id', authenticate, crudOperations._update(EstimateItem, [
        'wbs_item_id',
        'is_disable',
        'description',
        'code',
        'quantity',
        'hierachy_level',
        'is_item'
    ]))

    router.get('/:id', authenticate, crudOperations._getByID(EstimateItem))

    router.get('/', authenticate, crudOperations._getAll(EstimateItem))

    

    router.use(error_handler('EstimateItem'))

return router;
}