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

    // router.use(authenticate)

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

        let line_item = await LineItem._findById(id)
        let details = line_item.getDetails()
        res.status(200).send(entities)
        logService.log(`Line item details were sent`)

    }))


    /** Add one or more line_item_detail (LID) for testing purpuses
     *
     * 
     * @param {int} id - The ID that identify the line item.
     * @param {Array} req.body - An array of line item detail objects. 
     * 
     */
    router.post('/:id/details' , async_handler (async (req, res, next) => {
        const id = req.params.id
        
        const lineItem = await LineItem.findById(id)

        const array_of_line_item_details = req.body;

        let promises = array_of_line_item_details.map(async element => {

            let new_element = {}

            if(!element.is_assembly){
                new_element = utils.validateRequiredFields(element, [
                    'material_code',
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
                    'assembly_code',
                    'assembly_id',
                    'is_assembly',
                    'quantity',
                    'formula'    
                ]); 
                
            }

            //  Get unit rate of the LID
            let entity = await lineItem.addDetail(new_element)
            


            return lineItem.addDetail(new_element)
        });
        

        const entities = await Promise.all(promises)

        //  Everything went well

        res.status(200).send(entities)
        logService.log(`Line item details were added`)

    }))

    // TODO: 
    // * Validate relation to material or line item ids exits. 
    // * If it does not exits, create the new material as a service. 

    /** Add a line_item_detail (LID) instance referenced by id or code to the Line item 
     * It search the LID in the database by code or item. 
     * It takes the unit rate of the LID in both currencies and it calculates the unit rate of the Line item
     * It saves the line item with the new unit rate
     * 
     * @param {int} id - The ID that identify the line item.
     * @param {Object} req.body - The LID. 
     * 
     */
    router.post('/:id/detail' , async_handler (async (req, res, next) => {
        const id = req.params.id
        
        const lineItem = await LineItem.findById(id)

        let line_item_detail = req.body;

        line_item_detail = utils.validateRequiredFields(line_item_detail, [
            'id',
            'code',
            'is_assembly',
            'quantity',
            'formula'    
        ]);

        if(line_item_detail.is_assembly){

            //  This is is to avoid recursion.
            if(id == line_item_detail.id){
                throw {
                    isCustomError: true,
                    body: errors.LINE_ITEM_RECURSION
                }
            }
        }


        const lid = lineItem.addDetail(line_item_detail)

        //  Everything went well

        res.status(200).send(lid)
        logService.log(`Line item detail was added`)

    }))


    

    router.use(error_handler('LineItem'))

return router;
}