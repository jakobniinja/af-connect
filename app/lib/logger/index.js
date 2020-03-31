const winston = require("winston");
const expressWinston = require("express-winston");

const myFormat = winston.format.printf(logEntry => {
  return JSON.stringify(logEntry);
});

module.exports = expressWinston.logger({
  transports: [new winston.transports.Console()],
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.splat(),
    myFormat
  )
});
