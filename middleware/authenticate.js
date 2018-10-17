const authService = require('../services/auth.service')
const errors = require('../config/errors')

module.exports = (req, res, next) => {
  let tokenToVerify;

  let error_objet = {
    isCustomError: true,
    html_code: 401,
    body: errors.MISSING_TOKEN
}

  if (req.header('Authorization')) {
    const parts = req.header('Authorization').split(' ');

    if (parts.length === 2) {
      const scheme = parts[0];
      const credentials = parts[1];

      if (/^Bearer$/.test(scheme)) {
        tokenToVerify = credentials;
      } else {
        return next(error_objet)
      }
    } else {
        return next(error_objet)
    }
  } else if (req.body.token) {
    tokenToVerify = req.body.token;
    delete req.query.token;
  } else {
        return next(error_objet)
  }

  return authService.verify(tokenToVerify, (err, thisToken) => {
    if (err) return res.status(401).json({ err });
    req.token = thisToken;
    return next();
  });
};
