const express = require('express');
const error_handler = require('../middleware/error_handler')
const authenticate = require('../middleware/authenticate')
const addcrudRoutes = require('./crud');
let router = express.Router()

module.exports = (Parameter) => {

    const fieldsToInclude = [
        'project_id',
        'code',
        'description',
        'value'
    ]

    const fieldsToUpdate = [
        'code',
        'description',
        'value'
    ]

    router.use(authenticate)

    router = addcrudRoutes({
        model: Parameter,
        router,
        fields: {
            toAdd: fieldsToInclude,
            toUpdate: fieldsToUpdate
        }
    })

    router.use(error_handler('Parameter'))

return router;
}