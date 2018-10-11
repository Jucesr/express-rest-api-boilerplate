/**
 * @file 
 * Contains all the setting related to the application.
 * The configuration changes based on the enviroment. 
 */
    
module.exports = {
    development: {
        port: 3000
    },
    testing: {
        port: 3000
    },
    production: {
        port: process.env.PORT
    }    
}