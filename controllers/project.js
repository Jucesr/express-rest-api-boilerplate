const express = require('express');
const Project = require('../models/Project');
const error_handler = require('../middleware/error_handler')
const authenticate = require('../middleware/authenticate')
const crudOperations = require('./crud');

const router = express.Router()

router.post('/', authenticate, crudOperations._create(Project, [
    'name',
    'code',
    'description',
    'status',
    'type',
    'currency',
    'uen'
]))

router.delete('/:id', authenticate, crudOperations._delete(Project))

router.patch('/:id', authenticate, crudOperations._update(Project, [
    'name',
    'code',
    'description',
    'status',
    'type',
    'currency',
    'uen'
]))

router.get('/:id', authenticate, crudOperations._getByID(Project))

router.get('/', authenticate, crudOperations._getAll(Project))

router.use(error_handler('Project'))

module.exports = router;