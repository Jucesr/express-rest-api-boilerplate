const bcryptService = require('../services/bcrypt.service');
const authService = require('../services/auth.service');
const addCrudOperations = require('./crud');
const errors = require('../config/errors');

const ENTITY_NAME = 'User';

module.exports = (sequelize, DataTypes) => {
    const Op = sequelize.Op;

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

    /**
     * @param {Object} credentials - Contain credentials to log in. {email, username, password}
     */

    User._login = function (credentials) {
        const {username, email, password} = credentials;
        //let finder = !!username ? username : email

        return User.findAll({
            where: {
                [Op.or]: [{username}, {email}]
            }
        }).then(entity => {
            if(entity.length == 0){
              return Promise.reject({
                  isCustomError: 1,
                  body: errors.ENTITY_NOT_FOUND.replace('@ENTITY_NAME', ENTITY_NAME)  
              })
            }

            let instance = entity[0];
            
            if(!bcryptService.comparePassword(password, instance.password)){
              return Promise.reject({
                isCustomError: 1,
                body: errors.INCORRECT_PASSWORD
            }) 
            }

            let user = Object.assign({}, instance.toJSON())
            user.token = authService.issue({ email: user.email })
            return user

        })
    }

    /**@override 
     * @param {Object} entity - An object with all the required properties for User
     */
    User._create = function (entity){

        return this.create(entity).then( instance => {

            let user = Object.assign({}, instance.toJSON())
            user.token = authService.issue({ email: user.email })
            return user
        })
    }

    return User;
}