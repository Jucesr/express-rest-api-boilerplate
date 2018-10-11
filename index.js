
//  Third party libraries
const bodyParser = require('body-parser');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');

// Environment: development, staging, testing, production
const environment = process.env.NODE_ENV;

//  Controllers
const userController = require('./controllers/user')

//  App configuration
const config = require('./config/app')[environment];

//  Check database connection.
const dbService = require('./services/db.service');

dbService.authenticate().then(response => {

    console.log('Connection to the database has been established successfully');
    
    const app = express();

    // allow cross origin requests
    // configure to only allow requests from certain origins
    app.use(cors());

    // secure express app
    app.use(helmet({
        dnsPrefetchControl: false,
        frameguard: false,
        ieNoOpen: false,
    }));

    // parsing the request bodys
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());

    app.use('/user', userController);

    app.listen(config.port, () => {
        console.log(`Server running at port ${config.port}`);
        
    });


}).catch(e => {
    console.error('Unable to connect to the database', e);
});

