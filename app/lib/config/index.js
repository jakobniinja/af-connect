// config.js
const dotenv = require("dotenv");
dotenv.config();
module.exports = {
  useSSL: process.env.USE_SSL || false,
  host: process.env.HOST || "af-connect.local",
  healthPort: process.env.HEALTH_PORT || 9802,
  port: process.env.PORT || 3000,
  localPort: process.env.LOCAL_PORT || 4443,
  afLoginUrl:
    process.env.AF_LOGIN_URL ||
    "https://af-connect.local:9999/AuthenticationDispatcher/Dispatch?CT_ORIG_URL=https://af-connect.local",
  afJwtUrl:
    process.env.AF_JWT_URL ||
    "https://af-connect.local:9999/jwt/rest/idp/v0/klientID",
  afJwtHost: process.env.AF_JWT_HOST || "jwt.arbetsformedlingen.se",
  portabilityUrl: process.env.PORTABILITY_URL || "http://af-connect.local:8080",
  portabilityHost:
    process.env.PORTABILITY_HOST || "portabilitystage.arbetsformedlingen.se",
  ssoCookieName: process.env.SSO_COOKIE_NAME || "AMV_SSO_COOKIE",
  pkey: process.env.PKEY || "./cert_and_key/wc.arbetsformedlingen.se.key",
  sslcert: process.env.SSLCERT || "./cert_and_key/wc.arbetsformedlingen.se.crt"
};
