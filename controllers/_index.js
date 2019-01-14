const Models = require('../models/_index');

module.exports = (io) => {

    const files = [
        'user', 
        'project', 
        'estimate', 
        'parameter', 
        'estimate_item', 
        'line_item', 
        'material',
        'material_quotation'
    ]
    
    let controllers = {}
    
    files.forEach(file => {
        controllers[file] = require(`./${file}`)(Models, io)
    })

    return controllers

}