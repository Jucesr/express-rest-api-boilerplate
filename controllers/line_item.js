const express = require('express');
const async_handler = require('express-async-handler')
const error_handler = require('../middleware/error_handler')
const authenticate = require('../middleware/authenticate')
const addcrudRoutes = require('./crud');
const logService = require('../services/log.service')
const errors = require('../config/errors')
let router = express.Router()

const utils = require('../utils/utils')

module.exports = (models, io) => {

    const LineItem = models.line_item;

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
        let line_item = await LineItem.findById(id)
        let details = await line_item.getDetails()
        res.status(200).send(details)
        logService.log(`Line item details were sent`)

    }))

    // TODO: 
    // * If it does not exits, create the new material as a service. This feature should be implemented by the client

    /** Add a line_item_detail (LID) instance referenced by id or code to the Line item 
     * It search the LID in the database by code or item. 
     * It takes the unit rate of the LID in both currencies and it calculates the unit rate of the Line item
     * It saves the line item with the new unit rate
     * It lets other clients know the Line Item has changed
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


        const lid = await lineItem.addDetail({
         ...line_item_detail,
         project_id: lineItem.project_id   
        })

        //  Emit event to clients

        io.sockets.emit('UPDATE_LINE_ITEM', lineItem.id);

        res.status(200).send(lid)
        logService.log(`Line item detail was added`)

    }))

    router.patch('/:id/detail/:lid_id', async_handler (async (req, res, next) => {
        const id = req.params.id
        const LID_id = req.params.lid_id
    
        const lineItem = await LineItem.findById(id)

        let line_item_detail = req.body;
    
        line_item_detail = utils.validateRequiredFields(line_item_detail, [
            'id',
            'code',
            'is_assembly',
            'quantity',
            'formula'    
        ]);

        const lid = await lineItem.updateDetailByID(LID_id, line_item_detail)

        //  Emit event to clients

        io.sockets.emit('UPDATE_LINE_ITEM', lineItem.id);

        res.status(200).send(lid)
        logService.log(`Line item detail was updated`)

    }))

    router.delete('/:id/detail/:lid_id', async_handler (async (req, res, next) => {
        const id = req.params.id
        const LID_id = req.params.lid_id
    
        const lineItem = await LineItem.findById(id)

        const lid = await lineItem.deleteDetailByID(LID_id)

        res.status(200).send(lid)
        logService.log(`Line item detail was updated`)

    }))

    /** Copy a line item from one project to another.
     * It would create all the materials and sub line items need it.
     * WARNING: This method will create any material that does not exists. If it already exist it would take 
     * the current material. This could lead to some problems with the unit rate. 
     * 
     * @param {int} id - The ID that identify the line item that would be copy.
     * @param {int} project_id - The ID of the project that the line item would be copy to. 
     * 
     */
    router.put('/:id/copyTo/:project_id', async_handler (async (req, res, next) => {
        const line_item_id = req.params.id
        const project_id = parseInt(req.params.project_id, 10)
    
        const lineItem = await LineItem.findById(line_item_id)

        const new_line_item = await lineItem.copyToAnotherProject(project_id)

        res.status(200).send(new_line_item)
        logService.log(`Line item ${line_item_id} was copy from project ${lineItem.project_id} to project ${project_id}`)

    }))

    

    router.use(error_handler('LineItem'))

return router;
}

