// portability-api.js
const config = require("../config");
const request = require("request-promise");

function cv(ssoCookie, sessionToken) {
  return request({
    url: config.portabilityUrl + "/profile?sessionToken=" + sessionToken,
    resolveWithFullResponse: true,
    headers: {
      AMV_SSO_COOKIE: ssoCookie,
      host: config.portabilityHost
    }
  }).then(response => {
    // Read response from Portability api and extract the CV
    if (response.statusCode === 200) {
      return JSON.parse(response.body);
    } else {
      throw "failed to get cv from portabilty";
    }
  });
}

function store(ssoCookie, data) {
  return request({
    url: config.portabilityUrl + "/store",
    resolveWithFullResponse: true,
    headers: {
      host: config.portabilityHost
    },
    body: {
      token: ssoCookie,
      value: JSON.stringify(data)
    },
    method: "POST",
    json: true
  }).then(response => {
    // Read response from Portability api and extract the CV
    if (response.statusCode === 200) {
      return response.body;
    } else {
      throw "failed to save cv";
    }
  });
}

module.exports = {
  cv: cv,
  store: store
};
