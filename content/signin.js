document.addEventListener("DOMContentLoaded", function(event) {
    var signin = document.getElementById('signin2');
    signin.addEventListener('click', saveChanges, false);
    chrome.storage.sync.get(['username'], function(results) {
        if(typeof(results.username) !== 'undefined') {
            loggedIn(); // If there's a username saved
        }
    });
});

function saveChanges() {
    // Get a value saved in a form.
    var theValue = document.getElementById("auth-code").value;
    // Check that there's some code there.
    if (!theValue) {
        console.log('Error: No value specified');
        return;
    }

    var babblHttp2 = new XMLHttpRequest();
    var url='https://babbl.dev/api/v1/check_auth_code?auth_code=' + theValue;

    babblHttp2.onreadystatechange =  function() {
        if (this.readyState == 4 && this.status == 200) {
            resp = JSON.parse(this.responseText);
            user_email=resp["user_email"];
            // Save it using the Chrome extension storage API.
            chrome.storage.sync.set({username: user_email}, function() {
                // Notify that we saved.
                loggedIn();
            });
        }
    };
    babblHttp2.open("GET", url);
    babblHttp2.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    babblHttp2.send()
    
}
function testChanges() {
    // Test sync storage
    chrome.storage.sync.get(function(result) {alert(result.username)});
}

function loggedIn() {
    // Conditionally displays login or results depending on 
    // what's saved
    chrome.storage.sync.get(['username'], function(results) {
        document.getElementById("signedIn").style.display = "";
        document.getElementById("signedInUser").innerText = results.username;
        document.getElementById("signin-form").style.display = "none";

        /* Send welcome email */
        // Setup HTTP request
        var babblHttp = new XMLHttpRequest();
        var url='https://babbl.dev/api/v1/user_request';

        babblHttp.open("POST", url);
        babblHttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        babblHttp.send(JSON.stringify({
            "firstname": results.username, 
            "subject": "User Signed in from chrome ext! Woo!"
        })); 
    });
}