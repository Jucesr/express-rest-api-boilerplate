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