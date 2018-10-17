const express = require('express');
const error_handler = require('../middleware/error_handler')
const authenticate = require('../middleware/authenticate')
const logService = require('../services/log.service');
const addcrudRoutes = require('./crud')
let router = express.Router()

module.exports = (User) => {
    
    const fieldsToInclude = [
        'username',
        'email',
        'password'
    ]

    const fieldsToUpdate = [
        'password'
    ]
    router = addcrudRoutes({
        model: User,
        router,
        fields: {
            toAdd: fieldsToInclude,
            toUpdate: fieldsToUpdate
        },
        middleware: {
            action: authenticate,
            applyTo: {
                delete: true,
                update: true,
                getByID: true,
                getAll: true
            }
        },
    })

    //--------------------------------------------------------------------------------------
    //  Additional routes.
    //--------------------------------------------------------------------------------------

    router.post('/login', (req, res, next) => {
        const {body} = req;
        if( 
            (body.hasOwnProperty('email') || body.hasOwnProperty('username') ) && 
            body.hasOwnProperty('password')
        ){
            User._login(body).then(entity => {
                res.send(entity)
                logService.log(`${entity.username} has logged in.`)    
            }).catch( e => next({
                code: !!e.isCustomError ? 0 : 1,
                body: !!e.isCustomError? e.body : e
            }) )
        }else{
            return next({
                code: 0,
                body: `Properties (email or username) and password are required.`
            })    
        }
         
    })

    router.use(error_handler('User'))

    return router;
    
}