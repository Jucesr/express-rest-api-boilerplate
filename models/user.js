const bcryptService = require('../services/bcrypt.service');
const authService = require('../services/auth.service');
const addCrudOperations = require('./crud');

const ENTITY_NAME = 'User';

module.exports = (sequelize, DataTypes) => {

    const hooks = {
        beforeCreate(user) {
            user.password = bcryptService.encryptPassword(user.password)
        },
        beforeUpdate(user) {
            user.password = bcryptService.encryptPassword(user.password)
        }
    };

    let User = sequelize.define(ENTITY_NAME, {
        username: {
            type: DataTypes.STRING,
            unique: true
        },
        email: {
            type: DataTypes.STRING,
            unique: true,
            validate: {
            isEmail: {
                msg: "Must be a valid email"
            }
            }
        },
        password: {
            type: DataTypes.STRING
        }
    }, { 
    hooks, 
    tableName: ENTITY_NAME ,
    underscored: true 
    });


    User.prototype.toJSON = function () {
        const values = Object.assign({}, this.get());

        delete values.password;

    return values;
    };

    User = addCrudOperations(User, ENTITY_NAME);

    //  Overwrite Create operation.

    /**
     * @param {Object} entity - An object with all the required properties for User
     */
    User._create = function (entity){

        return this.create(entity).then( instance => {

            let user = Object.assign({}, instance.get())
            user.token = authService.issue({ email: user.email })
            return user
        })
    }

    return User;
}