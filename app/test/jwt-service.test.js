test("jwt service connectivity", () => {
  let jwtService = require("../lib/jwt-service");
  return jwtService
    .token("intentionally-invalid-sso-cookie-value")
    .then(() => {
      throw new Error("Should throw");
    })
    .catch(err => {
      expect(err.statusCode).toBe(401);
    });
});
