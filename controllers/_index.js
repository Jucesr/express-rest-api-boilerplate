const Models = require('../models/_index');

const files = ['user', 'project', 'estimate', 'parameter', 'estimate_item']

let controllers = {}

files.forEach(file => {
    controllers[file] = require(`./${file}`)(Models[file])
})


module.exports = controllers;