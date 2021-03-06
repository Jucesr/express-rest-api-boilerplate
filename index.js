
//  Third party libraries
const bodyParser = require('body-parser');
const express = require('express');
const socketIo = require("socket.io");
const helmet = require('helmet');
const cors = require('cors');

// Environment: development, staging, testing, production
const environment = process.env.NODE_ENV;

//  App configuration
const config = require('./config/app')[environment];

//  --------------------------Database connection----------------------------------.

const dbService = require('./services/db.service');
const logService = require('./services/log.service');

dbService.authenticate().then(response => {
    logService.log('Connection to the database has been established successfully')
}).catch(e => {
    logService.log('Unable to connect to the database')
});

//  --------------------------Server configurationn----------------------------------.

const app = express();

const io = socketIo.listen(
      app.listen(config.port,
        () => {
          console.log(`Listening on port ${config.port}`)
      }
    )
  );

// allow cross origin requests, configure to only allow requests from certain origins
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

io.sockets.on('connection', function (socket) {
    console.log('client connect');
    socket.on('echo', function (data) {
    io.sockets.emit('message', data);
  });
});


//  Controllers
const controllers = require('./controllers/_index')(io)

app.use('/user', controllers.user);
app.use('/project', controllers.project);
app.use('/estimate', controllers.estimate);
app.use('/parameter', controllers.parameter);
app.use('/estimate_item', controllers.estimate_item);
app.use('/line_item', controllers.line_item);
app.use('/material', controllers.material);
app.use('/material_quotation', controllers.material_quotation);


module.exports = app
