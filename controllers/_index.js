const Models = require('../models/_index');

const files = [
    'user', 
    'project', 
    'estimate', 
    'parameter', 
    'estimate_item', 
    'line_item', 
    'material',
    'line_item_detail',
    'material_quotation'
]

let controllers = {}

files.forEach(file => {
    controllers[file] = require(`./${file}`)(Models[file])
})


module.exports = controllers;