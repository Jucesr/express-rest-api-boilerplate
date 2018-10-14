const express = require('express');
const error_handler = require('../middleware/error_handler')
const authenticate = require('../middleware/authenticate')
const crudOperations = require('./crud');
const router = express.Router()

module.exports = (Material) => {
    router.post('/', authenticate, crudOperations._create(Material, [
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
    ]))

    router.delete('/:id', authenticate, crudOperations._delete(Material))

    router.patch('/:id', authenticate, crudOperations._update(Material, [
        'is_service',
        'code',
        'description',
        'uom',
        'currency',
        'base_cost',
        'other_cost',
        'waste_cost',
        'unit_rate'
    ]))

    router.get('/:id', authenticate, crudOperations._getByID(Material))

    router.get('/', authenticate, crudOperations._getAll(Material))

    router.use(error_handler('Material'))

return router;
}