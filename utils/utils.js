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

const validateRequiredFields = (obj, fieldsToInclude) => {
    let new_entity = {};

    //  Prepare the new entity with all the required fields
    for (let index = 0; index < fieldsToInclude.length; index++) {
        
        let field = fieldsToInclude[index]

        if (obj.hasOwnProperty(field)) {
            new_entity[ field ] = obj[ field ]
        }else{
            throw {
                isCustomError: true,
                body: errors.MISSING_PROPERTY.replace('@PROPERTY', field)
            }
        }

    }

    return new_entity;
}

module.exports = {
    parseSequelizeError,
    validateRequiredFields
}