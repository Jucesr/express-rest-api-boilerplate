/**
 * @file 
 * Contains all the error messages in the application. 
 */

module.exports = {
    ENTITY_NOT_FOUND: 'Id: @ID \t @ENTITY_NAME was not found.',
    FIELD_DUPLICATED: '@VALUE is already taken',
    FOREING_KEY_MISSING: 'A Foreign key was not provided or its invalid',
    INTERNAL_ERROR: 'Internal server error, please contact the administrator.',
    INCORRECT_PASSWORD: 'The password or username are not valid.',
    MISSING_PROPERTY: 'Property @PROPERTY is required.',
    MISSING_TOKEN: 'Token invalid. Please sign in to get a new one',
    LINE_ITEM_RECURSION: 'A line item cannot add itself, this would cause infinite recursion.'
}