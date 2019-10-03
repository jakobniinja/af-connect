"use strict"

var cv;
var selectedProfile = -1;

const config = {
    cookie: 'AMV_SSO_COOKIE',
    authUrl: 'https://secure.arbetsformedlingen.se/AuthenticationDispatcher/Dispatch?CT_ORIG_URL=https://demotest.arbetsformedlingen.se',
    cvUrl: '/fetchCV',
    consentForm: '/consentForm',
    consent: '/consent'
}

let getSessionToken = () => {
    var url = new URL(window.location.href);
    return url.searchParams.get("sessionToken");
}

let getCookie = (name) => {
    let value = '; ' + document.cookie;
    let parts = value.split('; ' + name + '=');
    if (parts.length == 2) return parts.pop().split(';').shift();
}

function onResponse(data) {
    cv = data;

    // Render the consent form
    fetch(config.consentForm, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(cv)
    }).then(response => {
        if (response.status !== 200) {
            console.log('Looks like there was a problem. Status code: ',
                response.status);
            return;
        }

        return response.text();
    })
    .then(form => {
        $('#consentForm').append(form);
        $('#resultPane').show();
        $('#consentControl').show();
    })
    .catch(err => console.log('Fetch Error :-S', err));

    console.log(cv);
}

function onConsent() {
    // Record CV in AF Connect OutBox
    cv.profile = cv.profiles[selectedProfile];
    delete cv.profiles;
    let save = JSON.stringify(cv);

    console.log('Consenting to CV: ', cv);
    fetch(config.consent + '?sessionToken=' + getSessionToken(), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: save
    })
    .then(response => {
        if (response.status !== 200) {
            console.log('Failed to consent. Status code: ',
                response.status);
            return;
        }

        console.log("Successfully saved to Outbox! session: ", getSessionToken());

        return response.text();
    })

    //window.close();
}

new Promise((resolve, reject) => {            
    // Start the AF login procedure if the cookie is not set
    let cookie = getCookie(config.cookie);
    if (cookie === undefined) {    
        // Open AF login page if AMV_SSO_COOKIE is not set
        window.location.href = config.authUrl + '/?sessionToken=' + getSessionToken();
    } else {
        // Cookie already exists, so just pass it along.
        resolve(cookie);
    }
})
.then((cookie) => {
    return fetch(config.cvUrl);
})
.then(response => {
    if (response.status === 401) {
        // Open AF login page because the AMV_SSO_COOKIE has expired
        window.location.href = config.authUrl;
        throw "Redirecting to AF login";
    }

    if (response.status !== 200) {
        console.log('Looks like there was a problem. Code: ' +
            response.status);
        throw "Failed to fetch CV";
    }

    return response.json()
        .catch(function(err) {
            console.log('Response parse error:', err);
        });
    }
)
.then(cv => {
    if (onResponse) {
        onResponse(cv);
    }
})
.catch(err => console.log('Failed to fetch CV, error:', err));
