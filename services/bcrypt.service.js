const bcrypt = require('bcrypt-nodejs');

const encryptPassword = (user) => {
    const salt = bcrypt.genSaltSync();
    const hash = bcrypt.hashSync(user.password, salt);

    return hash;
};

const comparePassword = (pw, hash) => (
    bcrypt.compareSync(pw, hash)
);


module.exports = {
    encryptPassword,
    comparePassword
};
