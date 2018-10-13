const express = require('express');
const error_handler = require('../middleware/error_handler')
const authenticate = require('../middleware/authenticate')
const crudOperations = require('./crud')
const router = express.Router()

module.exports = (User) => {
    
    router.post('/', crudOperations._create(User, [
        'username',
        'email',
        'password'
    ]))

    router.delete('/:id', authenticate, crudOperations._delete(User))

    router.patch('/:id', authenticate, crudOperations._update(User, [
        'password'
    ]))

    router.get('/:id', authenticate, crudOperations._getByID(User))

    router.get('/', authenticate, crudOperations._getAll(User))

    router.use(error_handler('User'))

    return router;
    
}