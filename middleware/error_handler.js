const logService = require('../services/log.service');
const utils = require('../utils/utils')
const errors = require('../config/errors');

module.exports = (entity) => {
  return (e, req, res, next) => {
    let error_message;
    switch (e.code) {
        case 0:
            //  Error that is controlled by the programmer. 
            error_message = e.body
        break;
            
        case 1:
            //  Sequelize error
            error_message = utils.parseSequelizeError(e.body)
        break;
            
        default:
            //  Unknow error (It should never enter here)
            error_message = errors.INTERNAL_ERROR
        break;
    }
      debugger;
      res.status(400).send({
        error: error_message
      });
    logService.log(`\n\nAn error has occurred in route '${entity}'`, e);
  }
}
