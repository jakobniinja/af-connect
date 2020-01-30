"use strict";

const { createLogger, format, transports } = require("winston");

const logger = createLogger({
  level: "debug",
  exitOnError: false,
  format: format.combine(
    format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss"
    }),
    format.json()
  ),
  transports: [new transports.Console()]
});

logger.info("Logger initalized");

module.exports = logger;
