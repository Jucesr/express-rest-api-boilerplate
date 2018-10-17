// TODO: Make a tryToParseError.
const logService = require('../services/log.service')
const utils = require('../utils/utils')

module.exports = (entity) => {
  return (e, req, res, next) => {
    let error = {
      user_message: '',
      console_message: ''
    };

    if(e.isCustomError){

      error.user_message = e.body
      error.console_message = e.body
    
    }else{
      
      error.user_message = utils.parseSequelizeError(e)
      error.console_message = e
    }

      res.status(e.html_code || 400).send({
        error: error.user_message
      });

    logService.log(`\n\nAn error has occurred in route '${entity}'`, error.console_message);
  }
}
