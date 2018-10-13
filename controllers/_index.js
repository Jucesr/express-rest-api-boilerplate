const Models = require('../models/_index');

const UserController = require('./user')
const ProjectController = require('./project')
const EstimateController = require('./estimate')
const ParameterController = require('./parameter')

let controllers = {
    user: UserController(Models.user),
    project: ProjectController(Models.project),
    estimate: EstimateController(Models.estimate),
    parameter: ParameterController(Models.parameter)
}

module.exports = controllers;