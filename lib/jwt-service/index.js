// jwt-service.js
const config = require('../config');
const request = require('request-promise');

function token(cookie) {
    return request({
        url: config.afJwtUrl,
        resolveWithFullResponse: true,
        headers: {
            'host': config.afJwtHost,
            'cookie': config.ssoCookieName + '=' + cookie
        }
    })
    .then(response => {
        // Read response from JWT service and extract the JWT token
        if (response.statusCode === 200) {
            return JSON.parse(response.body)['token'];
        } else {
            throw "failed to get jwt token";
        }
    });
}

module.exports = { token: token };
