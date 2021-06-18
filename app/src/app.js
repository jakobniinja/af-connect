const config = require("../lib/config");
const ejs = require("ejs");
const express = require("express");
const bodyParser = require("body-parser");
const portabilityApi = require("../lib/portability-api");
const fs = require("fs");
const https = require("https");
const http = require("http");
const whatHost = process.argv[2] || "deploy";
const logger = require("../lib/logger");

function getRequestCookie(req, name) {
  var value = "; " + req.headers.cookie;
  var parts = value.split("; " + name + "=");
  if (parts.length == 2)
    return parts
      .pop()
      .split(";")
      .shift();
}

module.exports = function() {
  this.app = undefined;
  this.server = undefined;
  this.cc = undefined;

  this.init = async () => {
    const CC = require("check-connectivity");
    this.cc = new CC({
      host: config.host,
      port: config.healthPort,
      debug: true,
      compatibleWith: {
        "af-connect-module": "^1.0.2-beta",
        "af-connect-mock": "^1.0.1-beta",
        "af-portability": "^1.0.0-beta"
      }
    });

    this.app = express();

    this.app.set("views", __dirname + "/../views");
    this.app.set("view engine", "ejs");
    this.app.engine("html", ejs.__express);
    this.app.use(bodyParser.urlencoded({ limit: "50mb", extended: false }));
    this.app.use(bodyParser.json({ limit: "50mb" }));

    this.app.use(this.cc.middleware());
    this.app.use("/css", express.static(__dirname + "/../public/css"));
    this.app.use("/img", express.static(__dirname + "/../public/img"));
    this.app.use("/js", express.static(__dirname + "/../public/js"));
    this.app.use("/fonts", express.static(__dirname + "/../public/fonts"));
    this.app.use("/vendor", express.static(__dirname + "/../public/vendor"));
    this.app.use(
      "/favicon.ico",
      express.static(__dirname + "/../public/favicon.ico")
    );

    this.app.use(logger);

    this.app.get("/", (req, res) => {
      res.render("pages/index", { afLoginUrl: config.afLoginUrl });
    });

    this.app.post("/consent", (req, res) => {
      portabilityApi
        .store(req.query.sessionToken, req.body)
        .then(body => {
          res.sendStatus(200);
        })
        .catch(err => {
          console.log("Failed to store in AF Connect Outbox, error:", err);
          res.sendStatus(500);
        });
    });

      this.app.get("/index", (req, res) => {
      // Create dummy data for use during development
      let debugData = {
        sessionToken: "bd48ff59-b652-4262-a13e-ba0ec85ed0e1",
        source: {
          sourceName: "Arbetsförmedlingen",
          termsAndConditions: []
        },
        sink: {
          sinkName: "Visma",
          purposeOfUse: [
            "Ansökan till roll 'System utvecklare' på 'JobTechDev'",
          ]
        },
        consent: {
          consentStatus: false,
          acceptedTerms: [],
          acceptedPurpose: []
        },
        transferObject: {
          documentType: "CV",
          dataStructureLink: "https://github.com/MagnumOpuses/common-cv-model",
          data: [
              {
                documentId: { value: "81994764"},
                alternateIds:[],
                person: {
                  legalId: "1973-09-06-9289",
                  ethnicity: [],
                  name: { given: "Nina", family: "Greger" },
                  communication: {},
                  identifyingMarks: [],
                  race: [],
                  nationality: [],
                  visa: [],
                  religion: [],
                  legalDocuments: []
                },
                profiles: [
                  { profileId: "94222",
                    profileName: "UX Designer",
                    education: [],
                    employment: [],
                    militaryService: [],
                    licenses: [],
                    certifications: [],
                    patents: [],
                    publications: [],
                    qualifications: []
                  },
                  { profileId: "96050",
                    profileName: "Arkitekt",
                    education: [],
                    employment: [],
                    militaryService: [],
                    licenses: [],
                    certifications: [],
                    patents: [],
                    publications: [],
                    qualifications: []
                  },
                  { profileId: "96105",
                    profileName: "Ellinor B",
                    education: [],
                    employment: [],
                    militaryService: [],
                    licenses: [],
                    certifications: [],
                    patents: [],
                    publications: [],
                    qualifications: []
                  },
                  { profileId: "93860",
                    profileName: "System Utvecklare",
                    education: [],
                    employment: [],
                    militaryService: [],
                    licenses: [],
                    certifications: [],
                    patents: [],
                    publications: [],
                    qualifications: []
                  },
                  { profileId: "94633",
                    profileName: "Personlig Tränare",
                    education: [],
                    employment: [],
                    militaryService: [],
                    licenses: [],
                    certifications: [],
                    patents: [],
                    publications: [],
                    qualifications: []
                  },
                  { profileId: "96049",
                    profileName: "Testare",
                    education: [],
                    employment: [],
                    militaryService: [],
                    licenses: [],
                    certifications: [],
                    patents: [],
                    publications: [],
                    qualifications: []
                  },
                  { profileId: "93903",
                    profileName: "System Ingenjör",
                    education: [],
                    employment: [],
                    militaryService: [],
                    licenses: [],
                    certifications: [],
                    patents: [],
                    publications: [],
                    qualifications: []
                  },
                  { profileId: "96018",
                    profileName: "Läkare",
                    education: [],
                    employment: [],
                    militaryService: [],
                    licenses: [],
                    certifications: [],
                    patents: [],
                    publications: [],
                    qualifications: []
                  },
                  { profileId: "94245",
                    profileName: "Scrum Master",
                    education: [],
                    employment: [],
                    militaryService: [],
                    licenses: [],
                    certifications: [],
                    patents: [],
                    publications: [],
                    qualifications: []
                  },
                  { profileId: "96019",
                    profileName: "Receptionist",
                    education: [],
                    employment: [],
                    militaryService: [],
                    licenses: [],
                    certifications: [],
                    patents: [],
                    publications: [],
                    qualifications: []
                  }
                ]
              }
          ]
        }
      };
      res.render("partials/consentForm", { data: debugData});
      // res.render("partials/consentForm", { data: req.body });
    });


    this.app.post("/consentForm", (req, res) => {
      res.render("partials/consentForm", { data: req.body });
    });

    this.app.get("/fetchCV", (req, res) => {
      let cookie = getRequestCookie(req, config.ssoCookieName);
      if (cookie === undefined) {
        console.log("No cookie supplied");
        res.sendStatus(401);
        return;
      }

      portabilityApi
        .cv(cookie, req.query.sessionToken)
        .then(cv => res.send(cv))
        .catch(err => {
          console.log(err);
          res.sendStatus(err.statusCode);
        });
    });

    if (config.useSSL) {
      const privateKey = fs.readFileSync(config.pkey, "utf8");
      const certificate = fs.readFileSync(config.sslcert, "utf8");
      const credentials = { key: privateKey, cert: certificate };
      this.server = https.createServer(credentials, this.app);
    } else {
      this.server = http.createServer(this.app);
    }
  };

  this.start = async () => {
    await this.cc.startup();
    await new Promise((resolve, reject) => {
      let usePort = config.useSSL ? config.localPort : config.port;

      if (config.host === "localhost") {
        this.server.listen(usePort, () => {
          console.log(`AF Connect listening on: ${config.host}:${usePort} !`);
          return resolve();
        });
      } else {
        this.server.listen(usePort, config.host, () => {
          console.log(`AF Connect listening on: ${config.host}:${usePort} !`);
          return resolve();
        });
      }
    });
  };

  this.stop = async () => {
    if (this.cc !== undefined) {
      await this.cc.shutdown();
    }

    if (this.server !== undefined) {
      await new Promise((resolve, reject) => {
        this.server.close(() => {
          return resolve();
        });
      });
    }

    console.log("AF Connect terminated successfully");
  };
};
