const express = require('express');
const error_handler = require('../middleware/error_handler')
const authenticate = require('../middleware/authenticate')
const crudOperations = require('./crud');
const router = express.Router()

module.exports = (Parameter) => {
    router.post('/', authenticate, crudOperations._create(Parameter, [
        'project_id',
        'code',
        'description',
        'value'
    ]))

    router.delete('/:id', authenticate, crudOperations._delete(Parameter))

    router.patch('/:id', authenticate, crudOperations._update(Parameter, [
        'code',
        'description',
        'value'
    ]))

    router.get('/:id', authenticate, crudOperations._getByID(Parameter))

    router.get('/', authenticate, crudOperations._getAll(Parameter))

    router.use(error_handler('Parameter'))

return router;
}