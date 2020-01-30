const logger = require('../logger');

module.exports = (req, res) => {
  res.on('finish', () => {
    let requestMethod = req.method;
    let requestbody = {};
    if (req.body) {
      for (let key in req.body) {
        requestbody[key] = req.body[key];
      }
    }
    let requestUrl = req.originalUrl;
    let requestIp = req.ip;
    let requestHost = req.hostname;

    let sessionToken = req.query.sessionToken ? req.query.sessionToken : (req.body.token) ? req.body.token : "";

    let responseStatus = res.statusCode;
    
    logger.log({
      level: 'info',
      requestMethod,
      requestUrl,
      requestIp,
      requestHost,
      requestbody,
      responseStatus,
      sessionToken
    })
  });
}