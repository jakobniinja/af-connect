"use strict";
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
  // Only keep the top-level domain from the hostname.
  const split = location.hostname.split(".");
  const tld = split.slice(split.length - 2).join(".");
  document.cookie = name + "=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=." + tld;
};

function onResponse(data) {
  window.cv = data;

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
}

window.onChangeUser = function onChangeUser() {
  clearCookie(config.cookie);
  location.reload();
  return false;
};

window.isProfileSelected = function isProfileSelected() {
  return (
    window.cv.transferObject.data[0].profiles !== undefined &&
    selectedProfile !== undefined
  );
};

window.onConsentRejection = function onConsentRejection() {
  // TODO: Propagate an consent reject message to data consumer service.
  window.close();
};

window.onConsent = function onConsent() {
  // Clear out all but the selected profile before saving to Outbox
  if (window.isProfileSelected()) {
    const specificProfile =
      window.cv.transferObject.data[0].profiles[selectedProfile];
    window.cv.transferObject.data[0].profiles = [specificProfile];
  } else {
    return new Promise((resolve, reject) => {
      resolve();
    });
  }

  window.cv.consent.consentTimestamp = new Date();
  window.cv.consent.consentStatus = true;

  window.cv.consent.consentedTimePeriod = new Date(
    window.cv.consent.consentTimestamp
  );
  window.cv.consent.consentedTimePeriod.setMonth(
    window.cv.consent.consentedTimePeriod.getMonth() + 1
  );
  window.cv.consent.acceptedPurposes = window.cv.sink.purposeOfUse;

  let save = JSON.stringify(window.cv);

  // Record CV in AF Connect OutBox
  fetch(config.consent + "?sessionToken=" + getSessionToken(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: save
  })
    .then(response => {
      if (response.status !== 200) {
        console.log("Failed to consent. Status code: ", response.status);
        return;
      }

      console.log("Successfully saved to Outbox! session: ", getSessionToken());

      window.close();
    })
    .catch(err => {
      console.log("Unexpected failure: ", err);
    });
};

// Control button active status, inactive if no selection
window.refreshFwdButton = function refreshFwdButton() {
  $("#button-1").prop("disabled", false);
  $("#button-1").css("background-color", "#00005a");
  $("#button-1").css("border", "#00005a solid 1px;");
}
window.refreshShareButton = function refreshShareButton() {
  const isSecrecyAgreementChecked = $("#secrecyAgreement").prop("checked");
  const isTransferAgreementChecked = $("#transferAgreement").prop("checked");
  const isReviewAgreementChecked = $("#reviewAgreement").prop("checked");
  const isTermsAgreementChecked = $("#termsAgreement").prop("checked");

  if (
    isSecrecyAgreementChecked &&
    isTransferAgreementChecked &&
    isReviewAgreementChecked &&
    isTermsAgreementChecked
  ) {
    $("#shareButton").prop("disabled", false);
    $("#shareButton").css("background-color", "#00005a");
    $("#shareButton").css("border", "#00005a solid 1px;");
  } else {
    $("#shareButton").prop("disabled", true);
    $("#shareButton").css("background-color", "#b9b9ca");
    $("#shareButton").css("border", "grey solid 1px;");
  }
};

window.secrecyAgreement = function secrecyAgreement() {
  window.refreshShareButton();
};

window.transferAgreement = function transferAgreement() {
  window.refreshShareButton();
};

window.reviewAgreement = function reviewAgreement() {
  window.refreshShareButton();
};

window.openTermsAgreement = function openTermsAgreement() {
  $("#termsModal").show();
  $("#termsAgreement").prop("checked", !$("#termsAgreement").prop("checked"));
};

window.onTermsAgreement = function onTermsAgreement() {
  $("#termsModal").hide();
  $("#termsAgreement").prop("checked", true);
  window.refreshShareButton();
};

window.onTermsCancel = function onTermsCancel() {
  $("#termsModal").hide();
  $("#termsAgreement").prop("checked", false);
  window.refreshShareButton();
};

function showPage(number) {
  window.document.getElementById("page-1").style.display = "none";
  window.document.getElementById("page-2").style.display = "none";
  window.document.getElementById("page-3").style.display = "none";
  window.document.getElementById("page-" + number).style.display = "block";

  if (number==2) {
    let profileList = window.document.getElementById("profile-list");
    // Iterate all children in profile list and set display = none
    let array = [ ...profileList.childNodes ];
    let x=0;
    array.forEach((profile,index) => {
      if (profile.style) {
        if (window.selectedProfile==x)
          profile.style.display = "block";
        else
          profile.style.display = "none";
        x++;
      }
    });
  }
}
// Clear consent when moving from consent page
function clearBoxes() {
  window.document.getElementById("secrecyAgreement").checked=false;
  window.document.getElementById("transferAgreement").checked=false;
  window.document.getElementById("reviewAgreement").checked=false;
  window.document.getElementById("termsAgreement").checked=false;
  refreshShareButton();
}

function consent() {
  // TODO
  console.log("Consented! CV=",window.cv);
}

$("#button-1").css("background-color", "#b9b9ca");
$("#button-1").css("border", "grey solid 1px;");
$("#button-1").prop("disabled", true);

$("#shareButton").css("background-color", "#b9b9ca");
$("#shareButton").css("border", "grey solid 1px;");
$("#shareButton").prop("disabled", true);
showPage(1);

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
    return fetch(config.cvUrl + "/?sessionToken=" + getSessionToken());
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
