const http = require("http");
const express = require("express");
const app = express();
const semver = require("semver");
const checkDependencies = require("check-dependencies");

const getHealth = options => {
  let status = "UP";

  const compatibleWithErrors = Object.keys(options.compatibleWith)
    .map(key => {
      if (!semver.validRange(options.compatibleWith[key])) {
        return `Invalid sememantic versioning range on options.compatibleWith['${key}']`;
      }
      return false;
    })
    .filter(element => {
      return element !== false;
    });
  if (compatibleWithErrors > 0) status = "ERRORED";

  return checkDependencies({}).then(dependencies => {
    if (!dependencies.depsWereOk) status = "ERRORED";

    return {
      name: process.env.npm_package_name,
      version: process.env.npm_package_version,
      status: status,
      uptime: process.uptime(),
      compatibleWith: {
        ...options.compatibleWith,
        error: compatibleWithErrors
      },
      dependencies: dependencies
    };
  });
};

const startServer = options => {
  const host = options.host || undefined;
  const port = options.port || 9800;
  const health = options.health || {};

  const httpServer = http.createServer(app);

  app.get("/health", (req, res, next) => {
    return getHealth(health)
      .then(health => {
        res.json(health);
      })
      .catch(err => res.status(500).json(err));
  });

  if (host !== undefined && host !== "localhost") {
    httpServer.listen(port, host, () =>
      console.log(`Health endpoint served on host:port: ${host}:${port} !`)
    );
  } else {
    httpServer.listen(port, () =>
      console.log(`Health endpoint served on port: ${port} !`)
    );
  }
};

module.exports = { startServer };
