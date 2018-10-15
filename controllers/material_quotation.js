const express = require('express');
const error_handler = require('../middleware/error_handler')
const authenticate = require('../middleware/authenticate')
const crudOperations = require('./crud');
const router = express.Router()

module.exports = (Material_Quotation) => {
    router.post('/', authenticate, crudOperations._create(Material_Quotation, [
        'project_id',
        'contact_id',
        'material_id',
        'date',
        'due_date',
        'unit_rate',
        'document_url'
    ]))

    router.delete('/:id', authenticate, crudOperations._delete(Material_Quotation))

    router.patch('/:id', authenticate, crudOperations._update(Material_Quotation, [
        'date',
        'due_date',
        'unit_rate',
        'document_url'
    ]))

    router.get('/:id', authenticate, crudOperations._getByID(Material_Quotation))

    router.get('/', authenticate, crudOperations._getAll(Material_Quotation))

    router.use(error_handler('Material_Quotation'))

return router;
}