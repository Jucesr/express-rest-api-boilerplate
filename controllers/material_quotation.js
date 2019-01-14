const express = require('express');
const error_handler = require('../middleware/error_handler')
const authenticate = require('../middleware/authenticate')
const addcrudRoutes = require('./crud');
let router = express.Router()

module.exports = (models) => {

    const Material_Quotation = models.material_quotation;

    const fieldsToInclude = [
        'project_id',
        'contact_id',
        'material_id',
        'date',
        'due_date',
        'unit_rate',
        'document_url'
    ]

    const fieldsToUpdate = [
        'date',
        'due_date',
        'unit_rate',
        'document_url'
    ]

    router.use(authenticate)

    router = addcrudRoutes({
        model: Material_Quotation,
        router,
        fields: {
            toAdd: fieldsToInclude,
            toUpdate: fieldsToUpdate
        }
    })

    router.use(error_handler('Material_Quotation'))

return router;
}