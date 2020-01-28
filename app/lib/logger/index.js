'use strict';

const { createLogger, format, transports } = require('winston');
const fs = require('fs');
const path = require('path');

/** 
const env = process.env.NODE_ENV || 'development';
const logDir = `../../../logs`;

if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}
*/

// const filename = path.join(logDir, 'main.log');

// TODO: Nedd to add logfile 

const logger = createLogger({
    level: 'debug',
    exitOnError: false,
    format: format.combine(
        format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        format.json()
    ),
    transports: [
        new transports.Console()
    ]
});

logger.info('Hello world');
logger.debug('Debugging info');

module.exports = logger;