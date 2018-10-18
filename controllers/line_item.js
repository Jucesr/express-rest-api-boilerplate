const express = require('express');
const async_handler = require('express-async-handler')
const error_handler = require('../middleware/error_handler')
const authenticate = require('../middleware/authenticate')
const addcrudRoutes = require('./crud');
const logService = require('../services/log.service')
const errors = require('../config/errors')
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

    // TODO: 
    // * Validate relation to material or line item ids exits. 
    // * Receive a flag to know wherer It is need to update or create a new one
    // * If it does not exits, create the new material as a service. 

    /** Add one or more line_item_detail instances to the Line item referenced by ID
     * 
     * @param {int} id - The ID that identify the line item.
     * @param {Array} req.body - An array of line item detail objects. 
     * 
     */
    router.post('/:id/detail' , async_handler (async (req, res, next) => {
        const id = req.params.id

        const lineItem = await LineItem._findById(id)

        const array_of_line_item_details = req.body;

        let promises = array_of_line_item_details.map(element => {

            let new_element = {}

            if(!element.is_assembly){
                new_element = utils.validateRequiredFields(element, [
                    'material_id',
                    'is_assembly',
                    'quantity',
                    'formula'    
                ]);
                
            }else{
                //  This is is to avoid recursion.
                if(id == element.assembly_id){
                    throw {
                        isCustomError: true,
                        body: errors.LINE_ITEM_RECURSION
                    }
                }

                new_element = utils.validateRequiredFields(element, [
                    'assembly_id',
                    'is_assembly',
                    'quantity',
                    'formula'    
                ]); 
                
            }
            return lineItem.createLine_Item_Detail(new_element)
        });
        

        const entities = await Promise.all(promises)

        //  Everything went well

        res.status(200).send(entities)
        logService.log(`Line item details were added`)

    }))

    router.use(error_handler('LineItem'))

return router;
}