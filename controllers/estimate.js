const express = require('express')
const async_handler = require('express-async-handler')
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

    router.get( '/:id/estimate_items', async_handler( async (req, res, next) => {
        const id = req.params.id

        let entities = await Estimate._getEstimateItems(id)

        res.status(200).send(entities)
        logService.log(`Estimate items were sent`)

    }))

    router.use(error_handler('Estimate'))

return router;
}