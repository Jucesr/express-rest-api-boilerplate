
//  Third party libraries
const bodyParser = require('body-parser');
const express = require('express');
const http = require("http");
const socketIo = require("socket.io");
const helmet = require('helmet');
const cors = require('cors');


// Environment: development, staging, testing, production
const environment = process.env.NODE_ENV;

//  Controllers
const controllers = require('./controllers/_index')(io)

//  App configuration
const config = require('./config/app')[environment];

//  Check database connection.
const dbService = require('./services/db.service');
const logService = require('./services/log.service');

dbService.authenticate().then(response => {
    logService.log('Connection to the database has been established successfully')
}).catch(e => {
    logService.log('Unable to connect to the database')
});

//  Server configuration
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

app.use('/user', controllers.user);
app.use('/project', controllers.project);
app.use('/estimate', controllers.estimate);
app.use('/parameter', controllers.parameter);
app.use('/estimate_item', controllers.estimate_item);
app.use('/line_item', controllers.line_item);
app.use('/material', controllers.material);
app.use('/material_quotation', controllers.material_quotation);


const server = http.createServer(app);
const io = socketIo(server);

io.on("connection", socket => {
    console.log("New client connected")

    

    socket.on("disconnect", () => console.log("Client disconnected"));
});

// const getApiAndEmit = async socket => {
// try {
//     const res = await axios.get(
//     "https://api.darksky.net/forecast/PUT_YOUR_API_KEY_HERE/43.7695,11.2558"
//     );
//     socket.emit("FromAPI", res.data.currently.temperature);
// } catch (error) {
//     console.error(`Error: ${error.code}`);
// }
// };




if(environment != 'testing'){

    server.listen(config.port, () => {
        console.log(`Listening on port ${config.port}`)
    })
    // app.listen(config.port, () => {
    //     console.log(`Server running at port ${config.port}`);
        
    // });
}




module.exports = app
