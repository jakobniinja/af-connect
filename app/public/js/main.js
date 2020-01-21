"use strict";

var cv;
var selectedProfile = -1;

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

window.onConsentRejection = function onConsentRejection() {
  // TODO: Propagate an consent reject message to data consumer service.
  window.close();
};

window.onConsent = function onConsent() {
  // Record CV in AF Connect OutBox
  cv.profile = cv.profiles[selectedProfile];
  delete cv.profiles;

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
  console.log("cookie: ", cookie);
  console.log("getSessionToken: ", getSessionToken());
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
    console.log(response);
    if (response.status === 401) {
      // Open AF login page because the AMV_SSO_COOKIE has expired
      window.location.href = config.afLoginUrl;
      throw "Redirecting to AF login";
    }

    if (response.status !== 200) {
      console.log("Looks like there was a problem. Code: " + response.status);
      throw "Failed to fetch CV";
    }

    return response.json().catch(function(err) {
      console.log("Response parse error:", err);
    });
  })
  .then(cv => {
    if (onResponse) {
      onResponse(cv);
    }
  })
  .catch(err => console.log("Failed to fetch CV, error:", err));
