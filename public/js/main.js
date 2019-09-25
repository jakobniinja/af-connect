"use strict"

const config = {
    cookie: 'AMV_SSO_COOKIE',
    authUrl: 'https://secure.arbetsformedlingen.se/AuthenticationDispatcher/Dispatch?CT_ORIG_URL=https://demotest.arbetsformedlingen.se',
    cvUrl: '/fetchCV',
    consentForm: '/consentForm'
}

let getCookie = (name) => {
    let value = '; ' + document.cookie;
    let parts = value.split('; ' + name + '=');
    if (parts.length == 2) return parts.pop().split(';').shift();
}

function onResponse(cv) {
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
    // TODO: Record consent and store envelope in AF Connect OutBox
    window.close();
}

new Promise((resolve, reject) => {            
    // Start the AF login procedure if the cookie is not set
    let cookie = getCookie(config.cookie);
    if (cookie === undefined) {    
        // Open AF login page if AMV_SSO_COOKIE is not set
        window.location.href = config.authUrl;
    } else {
        // Cookie already exists, so just pass it along.
        resolve(cookie);
    }
})
.then((cookie) => {
    console.log('Received cookie...');
    console.log('Fetching CV...');
    return fetch(config.cvUrl);
})
.then(response => {
    console.log('Received response...');

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
    console.log('Handle response...');
    if (onResponse) {
        onResponse(cv);
    }
})
.catch(err => console.log('Failed to fetch CV, error:', err));
