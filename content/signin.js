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
    var theValue = document.getElementById("username").value;
    // Check that there's some code there.
    if (!theValue) {
        console.log('Error: No value specified');
        return;
    }
    // Save it using the Chrome extension storage API.
    chrome.storage.sync.set({username: theValue}, function() {
        // Notify that we saved.
        loggedIn();
    });
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
        var url='http://127.0.0.1:8080/api/v1/user_request';

        babblHttp.open("POST", url);
        babblHttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        babblHttp.send(JSON.stringify({
            "firstname": results.username, 
            "subject": "User Signed in from chrome ext! Woo!"
        })); 
    });
}