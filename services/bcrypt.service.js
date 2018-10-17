const bcrypt = require('bcrypt-nodejs');

const encryptPassword = (password) => {
    //const salt = bcrypt.genSaltSync();
    const hash = bcrypt.hashSync(password);
    return hash;
};

const comparePassword = (pw, hash) => {
    return bcrypt.compareSync(pw, hash)   
};


module.exports = {
    encryptPassword,
    comparePassword
};
