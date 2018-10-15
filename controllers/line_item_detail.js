const express = require('express');
const error_handler = require('../middleware/error_handler')
const authenticate = require('../middleware/authenticate')
const crudOperations = require('./crud');
const router = express.Router()

module.exports = (Line_Item_Detail) => {
    router.post('/', authenticate, crudOperations._create(Line_Item_Detail, [
        'project_id',
        'line_item_id',
        'material_id',
        'assembly_id',
        'is_assembly',
        'quantity',
        'formula'
    ]))

    router.delete('/:id', authenticate, crudOperations._delete(Line_Item_Detail))

    router.patch('/:id', authenticate, crudOperations._update(Line_Item_Detail, [
        'line_item_id',
        'material_id',
        'assembly_id',
        'is_assembly',
        'quantity',
        'formula',
    ]))

    router.get('/:id', authenticate, crudOperations._getByID(Line_Item_Detail))

    router.get('/', authenticate, crudOperations._getAll(Line_Item_Detail))

    

    router.use(error_handler('Line_Item_Detail'))

return router;
}