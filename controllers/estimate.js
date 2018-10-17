const express = require('express');
const error_handler = require('../middleware/error_handler')
const authenticate = require('../middleware/authenticate')
const addcrudRoutes = require('./crud');
let router = express.Router()

module.exports = (Estimate) => {

    const fieldsToInclude = [
        'project_id',
        'code',
        'name',
        'description',
        'currency'
    ]

    const fieldsToUpdate = [
        'code',
        'name',
        'description',
        'currency'
    ]

    router.use(authenticate)

    router = addcrudRoutes({
        model: Estimate,
        router,
        fields: {
            toAdd: fieldsToInclude,
            toUpdate: fieldsToUpdate
        }
    })

    //--------------------------------------------------------------------------------------
    //  Additional routes.
    //--------------------------------------------------------------------------------------

    router.get('/:id/estimate_item', authenticate ,(req, res, next) => {
        const id = req.params.id
        Estimate._getEstimateItems(id).then(entities => {
            res.status(200).send(entities)
            logService.log(`Estimate items were sent`)
        }).catch( e => next({
            code: !!e.isCustomError ? 0 : 1,
            body: !!e.isCustomError? e.body : e
        }) )
    })

    router.use(error_handler('Estimate'))

return router;
}