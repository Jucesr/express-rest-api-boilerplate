const express = require('express');
const async_handler = require('express-async-handler')
const error_handler = require('../middleware/error_handler')
const authenticate = require('../middleware/authenticate')
const addcrudRoutes = require('./crud');
const logService = require('../services/log.service');
let router = express.Router()

const utils = require('../utils/utils')

module.exports = (LineItem) => {

    const fieldsToInclude = [
        'project_id',
        'wbs_item_id',
        'code',
        'spanish_description',
        'english_description',
        'uom'
    ]

    const fieldsToUpdate = [
        'project_id',
        'wbs_item_id',
        'code',
        'spanish_description',
        'english_description',
        'uom'
    ]

    router.use(authenticate)

    router = addcrudRoutes({
        model: LineItem,
        router,
        fields: {
            toAdd: fieldsToInclude,
            toUpdate: fieldsToUpdate
        }
    })

    //--------------------------------------------------------------------------------------
    //  Additional routes.
    //--------------------------------------------------------------------------------------

    router.get('/:id/detail' , async_handler (async (req, res, next) => {
        const id = req.params.id

        let entities = await LineItem._getDetails(id)
        res.status(200).send(entities)
        logService.log(`Line item details were sent`)

    }))

    /** Add one or more line_item_detail instances to the Line item referenced by ID
     * 
     * @param {int} id - The ID that identify the line item.
     * @param {Array} req.body - An array of line item detail objects. 
     */
    router.post('/:id/detail' , async_handler (async (req, res, next) => {
        const id = req.params.id

        const lineItem = await LineItem._findById(id)

        const array_of_line_item_details = req.body;

        const fieldsToInclude = [
            'material_id',
            'assembly_id',
            'is_assembly',
            'quantity',
            'formula'
        ]
        
        let promises = array_of_line_item_details.map(element => {

            let new_element = utils.validateRequiredFields(element, fieldsToInclude);

            if(!element.is_assembly){
                console.log('Will add material');
                
                return Promise.resolve();
                return lineItem.addMaterial(new_element) 
            }else{
                console.log('Will add line item');
                return Promise.resolve();
                return lineItem.addLineItemDetail(new_element)
            } 
        });

        const entities = await Promise.all(promises)

        //  Everything went well

        res.status(200).send(entities)
        logService.log(`Line item details were added`)

    }))

    router.use(error_handler('LineItem'))

return router;
}