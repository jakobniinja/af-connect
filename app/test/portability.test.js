test("portability connectivity", () => {
  const config = require("../lib/config");
  const request = require("request-promise");
  return request({
    url: config.portabilityUrl + "/",
    resolveWithFullResponse: true
  })
    .then(response => {
      expect(response.statusCode).toBe(200);
    })
    .catch(err => {
      throw "failed to connect to portability api";
    });
});
