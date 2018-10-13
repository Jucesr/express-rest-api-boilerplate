const express = require('express');
const error_handler = require('../middleware/error_handler')
const authenticate = require('../middleware/authenticate')
const crudOperations = require('./crud');
const router = express.Router()

module.exports = (Estimate) => {
    router.post('/', authenticate, crudOperations._create(Estimate, [
        'project_id',
        'code',
        'name',
        'description',
        'currency'
    ]))

    router.delete('/:id', authenticate, crudOperations._delete(Estimate))

    router.patch('/:id', authenticate, crudOperations._update(Estimate, [
        'code',
        'name',
        'description',
        'currency'
    ]))

    router.get('/:id', authenticate, crudOperations._getByID(Estimate))

    router.get('/', authenticate, crudOperations._getAll(Estimate))

    router.use(error_handler('Estimate'))

return router;
}