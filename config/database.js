/**
 * @file 
 * Contains all the setting related to the database connection.
 * The configuration changes based on the enviroment. 
 */

module.exports = {
    development: {
        database: 'DEV_TESTING',
        username: 'sas',
        password: '1234',
        host: 'localhost',
        dialect: 'mssql',
    },
    testing: {
        database: 'DEV_TESTING',
        username: 'sa',
        password: '1234',
        host: 'localhost',
        dialect: 'mssql',
    },
    production: {
        database: 'database',
        username: 'username',
        password: 'password',
        host: 'host',
        dialect: 'mssql',
    } 
}