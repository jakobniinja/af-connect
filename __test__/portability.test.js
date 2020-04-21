describe("portability", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.unmock("request-promise");
  });

  test("fetch cv", async done => {
    jest.mock("request-promise", () => {
      return jest.fn().mockImplementation(() => {
        return Promise.resolve().then(() => ({
          statusCode: 200,
          body: JSON.stringify({
            message: "A message"
          })
        }));
      });
    });

    const portability = require("../app/lib/portability-api");
    await portability.cv();
    done();
  });

  test("store cv", async done => {
    jest.mock("request-promise", () => {
      return jest.fn().mockImplementation(() => {
        return Promise.resolve().then(() => ({
          statusCode: 200,
          body: JSON.stringify({
            message: "A message"
          })
        }));
      });
    });

    const portability = require("../app/lib/portability-api");
    const response = await portability.store("cookie123", {});
    const res = JSON.parse(response);
    expect(res.message).toBe("A message");
    done();
  });
});
