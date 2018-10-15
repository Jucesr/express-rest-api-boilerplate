const express = require('express');
const error_handler = require('../middleware/error_handler')
const authenticate = require('../middleware/authenticate')
const crudOperations = require('./crud');
const logService = require('../services/log.service');
const router = express.Router()

module.exports = (LineItem) => {
    router.post('/', authenticate, crudOperations._create(LineItem, [
        'project_id',
        'wbs_item_id',
        'code',
        'spanish_description',
        'english_description',
        'uom'
    ]))

    router.delete('/:id', authenticate, crudOperations._delete(LineItem))

    router.patch('/:id', authenticate, crudOperations._update(LineItem, [
        'project_id',
        'wbs_item_id',
        'code',
        'spanish_description',
        'english_description',
        'uom'
    ]))

    router.get('/:id', authenticate, crudOperations._getByID(LineItem))

    router.get('/', authenticate, crudOperations._getAll(LineItem))

    router.get('/:id/detail', authenticate ,(req, res, next) => {
        const id = req.params.id
        LineItem._getDetails(id).then(entities => {
            debugger;
            res.status(200).send(entities)
            logService.log(`Line item details were sent`)
        }).catch( e => next({
            code: !!e.isCustomError ? 0 : 1,
            body: !!e.isCustomError? e.body : e
        }) )
    })

    router.use(error_handler('LineItem'))

return router;
}