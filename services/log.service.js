const log = (message, e) => {
    if(process.env.LOG){
      console.log(message);
      if(e)
        console.error(e);
    }
}

module.exports = {
    log
}