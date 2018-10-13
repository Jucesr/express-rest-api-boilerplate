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
            parsedErrorMessage = errors.FIELD_DUPLICATED.replace('@VALUE', error.errors[0].value)
        break;

        case "SequelizeForeignKeyConstraintError":
            parsedErrorMessage = errors.FOREING_KEY_MISSING
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