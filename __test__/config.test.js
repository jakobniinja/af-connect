describe("Config", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.unmock("dotenv");
  });

  test("defaults", () => {
    jest.mock("dotenv", () => ({
      config: () => {
        delete process.env.USE_SSL;
        delete process.env.HOST;
        delete process.env.HEALTH_PORT;
        delete process.env.PORT;
        delete process.env.LOCAL_PORT;
        delete process.env.AF_LOGIN_URL;
        delete process.env.AF_JWT_URL;
        delete process.env.AF_JWT_HOST;
        delete process.env.PORTABILITY_URL;
        delete process.env.PORTABILITY_HOST;
        delete process.env.SSO_COOKIE_NAME;
        delete process.env.PKEY;
        delete process.env.SSLCERT;
        return {};
      }
    }));

    const config = require("../app/lib/config");

    expect(config.useSSL).toBe(false);
    expect(config.host).toBe("af-connect.local");
    expect(config.healthPort).toBe(9801);
    expect(config.port).toBe(3000);
    expect(config.localPort).toBe(4443);
    expect(config.afLoginUrl).toBe(
      "https://af-connect.local:9999/AuthenticationDispatcher/Dispatch?CT_ORIG_URL=https://af-connect.local"
    );
    expect(config.afJwtUrl).toBe(
      "https://af-connect.local:9999/jwt/rest/idp/v0/klientID"
    );
    expect(config.afJwtHost).toBe("jwt.arbetsformedlingen.se");
    expect(config.portabilityUrl).toBe("http://af-connect.local:8080");
    expect(config.portabilityHost).toBe(
      "portabilitystage.arbetsformedlingen.se"
    );
    expect(config.ssoCookieName).toBe("AMV_SSO_COOKIE");
  });
});
