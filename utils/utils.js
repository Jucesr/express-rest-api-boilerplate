const errors = require('../config/errors');

const parseSequelizeError = (error) => {
    
    let parsedErrorMessage;
    switch (error.name) {
        case "SequelizeDatabaseError":
            parsedErrorMessage = errors.INTERNAL_ERROR
        break;

        case "SequelizeValidationError":
            parsedErrorMessage = `${error.errors[0].value} ${error.errors[0].message}`
        break;

        case "SequelizeUniqueConstraintError":
            parsedErrorMessage = `${error.errors[0].value} is already taken`
        break;
    
        default:
            parsedErrorMessage = errors.INTERNAL_ERROR
            break;
    }
    return parsedErrorMessage
}

module.exports = {
    parseSequelizeError
}