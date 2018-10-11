const log = (message, e) => {
    if(process.env.NODE_ENV != 'testing'){
      console.log(message);
      if(e)
        console.error(e);
    }
}

module.exports = {
    log
}