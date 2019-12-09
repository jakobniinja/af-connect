// jwt-service.js
const config = require("../config");
const request = require("request-promise");

function token(cookie) {
  process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0; // TODO: Remove this line when we have valid certificate....
  return request({
    url: config.afJwtUrl,
    resolveWithFullResponse: true,
    headers: {
      host: config.afJwtHost,
      cookie: config.ssoCookieName + "=" + cookie
    }
  }).then(response => {
    // Read response from JWT service and extract the JWT token
    if (response.statusCode === 200) {
      const jwtToken = JSON.parse(response.body)["token"];
      return jwtToken;
    } else {
      throw "failed to get jwt token";
    }
  });
}

module.exports = { token: token };
