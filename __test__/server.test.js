const fetch = require("node-fetch");

test("Start app", async () => {
  const AfConnect = require("../app/src/app");
  const afConnect = new AfConnect();
  await afConnect.init();
  await afConnect.start();

  const result = await fetch("http://localhost:9801/health");
  expect(result.status).toBe(200);
  const body = await result.json();
  expect(body.status).toBe("UP");

  await afConnect.stop();
});

test("Re-start app", async () => {
  const AfConnect = require("../app/src/app");
  const afConnect = new AfConnect();
  await afConnect.init();
  await afConnect.start();
  await afConnect.stop();
  await afConnect.start();
  await afConnect.stop();
});
