(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
module.exports = class Envelope {
  constructor(build) {
    this.source = {
      sourceId: build.sourceId,
      sourceName: build.sourceName,
      allowsWrite: build.allowsWrite
    };
    this.consent = {
      consentTimestamp: build.consentTimestamp,
      consentStatus: build.consentStatus,
      consentedTimePeriod: build.consentedTimePeriod
    };
    this.data = {
      size: build.size,
      documentType: build.documentType,
      dataStructureLink: build.dataStructureLink,
      data: build.data
    };
  }
  static get Builder() {
    class Builder {
      constructor() {}

      withSourceId(sourceId) {
        this.sourceId = sourceId;
        return this;
      }

      withSourceName(sourceName) {
        this.sourceName = sourceName;
        return this;
      }

      withAllowsWrite(allowsWrite) {
        this.allowsWrite = allowsWrite;
        return this;
      }

      withConsentTimestamp(consentTimestamp) {
        this.consentTimestamp = consentTimestamp;
        return this;
      }

      withConsentStatus(consentStatus) {
        this.consentStatus = consentStatus;
        return this;
      }

      withConsentedTimePeriod(consentedTimePeriod) {
        this.consentedTimePeriod = consentedTimePeriod;
        return this;
      }

      withSize(size) {
        this.size = size;
        return this;
      }

      withDocumentType(documentType) {
        this.documentType = documentType;
        return this;
      }

      withDataStructureLink(dataStructureLink) {
        this.dataStructureLink = dataStructureLink;
        return this;
      }

      withData(data) {
        this.data = data;
        return this;
      }

      build() {
        return new Envelope(this);
      }
    }
    return Builder;
  }
};

},{}],2:[function(require,module,exports){
"use strict";

var cv;

let configElement = document.getElementById("config");
let config = {
  cookie: "AMV_SSO_COOKIE",
  afLoginUrl: configElement.getAttribute("data-af_login_url"),
  cvUrl: "/fetchCV",
  consentForm: "/consentForm",
  consent: "/consent"
};

let getSessionToken = () => {
  var url = new URL(window.location.href);
  return url.searchParams.get("sessionToken");
};

let getCookie = name => {
  let value = "; " + document.cookie;
  let parts = value.split("; " + name + "=");
  if (parts.length == 2)
    return parts
      .pop()
      .split(";")
      .shift();
};

let clearCookie = name => {
  const split = location.hostname.split(".");
  const tld = split.slice(split.length - 2).join(".");
  document.cookie = name + "=; path=/; domain=." + tld;
};

function onResponse(data) {
  cv = data;

  // Render the consent form
  fetch(config.consentForm, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(cv)
  })
    .then(response => {
      if (response.status !== 200) {
        console.log(
          "Looks like there was a problem. Status code: ",
          response.status
        );
        return;
      }

      return response.text();
    })
    .then(form => {
      $("#consentForm").append(form);
      $("#resultPane").show();
      $("#consentControl").show();
    })
    .catch(err => console.log("Fetch Error :-S", err));

  console.log(cv);
}

window.onChangeUser = function onChangeUser() {
  clearCookie(config.cookie);
  location.reload();
  return false;
};

window.onConsentRejection = function onConsentRejection() {
  // TODO: Propagate an consent reject message to data consumer service.
  window.close();
};

window.onConsent = function onConsent() {
  // Clear out all but the selected profile before saving to Outbox
  if (cv.profiles !== undefined && selectedProfile !== undefined) {
    const specificProfile = cv.profiles[selectedProfile];
    delete cv.profiles;
    cv.profiles = [specificProfile];
  }

  // Record CV in AF Connect OutBox
  return new Promise((resolve, reject) => {
    resolve();
  })
    .then(() => {
      // Build envelope
      let consentTimestamp = new Date();
      let consentedTimePeriod = new Date(consentTimestamp);
      consentedTimePeriod.setMonth(consentedTimePeriod.getMonth() + 1);

      let Envelope = require("../../lib/envelope");
      let envelope = new Envelope.Builder()
        .withSourceId("01")
        .withSourceName("Arbetsformedlingen")
        .withAllowsWrite(true)
        .withConsentTimestamp(consentTimestamp.toISOString())
        .withConsentStatus(true)
        .withConsentedTimePeriod(consentedTimePeriod.toISOString())
        .withSize("500")
        .withDocumentType("CV")
        .withDataStructureLink(
          "https://github.com/MagnumOpuses/common-cv-model/tree/master/common%20data%20structure"
        )
        .withData(cv)
        .build();

      // Validate cv against schemaes;
      return envelope;
    })
    .then(envelope => {
      // Validate envelope against schema
      /*
      let refParser = require("json-schema-ref-parser");
      return refParser
        .dereference("../../lib/common-cv-model/envelope/DataEnvelope.json", {})
        .then(function(dereferencedSchema) {
          let validatorResult = validator.validate(
            envelope,
            dereferencedSchema
          );
          if (validatorResult.errors.length > 0) {
            throw "Envelope contains validation errors!";
          }

          return envelope;
        });*/
      return envelope;
    })
    .then(envelope => {
      let save = JSON.stringify(envelope);

      fetch(config.consent + "?sessionToken=" + getSessionToken(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: save
      }).then(response => {
        if (response.status !== 200) {
          console.log("Failed to consent. Status code: ", response.status);
          return;
        }

        console.log(
          "Successfully saved to Outbox! session: ",
          getSessionToken()
        );

        window.close();
      });
    })
    .catch(err => {
      console.log("Unexpected failure: ", err);
    });
};

new Promise((resolve, reject) => {
  // Start the AF login procedure if the cookie is not set
  let cookie = getCookie(config.cookie);
  if (cookie === undefined) {
    // Open AF login page if AMV_SSO_COOKIE is not set
    window.location.href =
      config.afLoginUrl + "/?sessionToken=" + getSessionToken();
  } else {
    // Cookie already exists, so just pass it along.
    resolve(cookie);
  }
})
  .then(cookie => {
    return fetch(config.cvUrl);
  })
  .then(response => {
    switch (response.status) {
      case 200:
        return response.json().catch(function(err) {
          console.log("Response parse error:", err);
        });
      case 404:
        // TODO: This response code is a bit ambiguous. The reason
        // might be that the CV simply does not exist, or the sso
        // cookie have been rejected. These two cases should be
        // differentiated in the error propagation and handling.
        alert("CV not found, clearing sso cookie and retrying");
        clearCookie(config.cookie);
        location.reload();
        break;
      case 401:
        // Open AF login page because the AMV_SSO_COOKIE has expired
        window.location.href =
          config.afLoginUrl + "/?sessionToken=" + getSessionToken();
        throw "Redirecting to AF login";
      default:
        console.log("Looks like there was a problem. Code: " + response.status);
        throw "Failed to fetch CV";
    }
  })
  .then(cv => {
    if (onResponse) {
      onResponse(cv);
    }
  })
  .catch(err => console.log("Failed to fetch CV, error:", err));

},{"../../lib/envelope":1}]},{},[2]);
