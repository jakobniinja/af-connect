// portability-api.js
const config = require('../config');
const request = require('request-promise');

function cv(token) {
    return request({
        url: config.portabilityUrl,
        resolveWithFullResponse: true,
        headers: {
            'X-JWT-Assertion': token,
            'host': config.portabilityHost
        }
    })
    .then(response => {
        // Read response from Portability api and extract the CV
        if (response.statusCode === 200) {
            return JSON.parse(response.body);
        } else {
            throw "failed to get cv from portabilty";
        }
    });
}

module.exports = { cv: cv };
