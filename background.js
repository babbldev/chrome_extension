/* background.js */
/******* 
 * Background scripts are what run chrome extensions, all message
 * passing is handled here, notifications are sent from here; it's 
 * the backbone of the app. 
*/

var contextMenus = {};

function isInt(value) {
    // I'm bad at js, this was helpful
    return !isNaN(value) && 
           parseInt(Number(value)) == value && 
           !isNaN(parseInt(value, 10));
}

// Analysis complete, send notification
function notify() {
    chrome.storage.sync.get(["send_notifications"], function (results) {
        if (results.send_notifications) { // User has notifications toggled ON
            chrome.notifications.create(
                "Article Analyzer",
                {
                type: "basic",
                iconUrl: "icon.png",
                title: "Article Analysis Complete",
                message: "Click the icon at top to view analysis.",
                },
                function (noteId) { // Callback for notification that ran
                    console.log("Notification: ", noteId);
                    //console.log(chrome.runtime.lastError);
                }
            );
        } else { // Notifications toggled OFF
            console.log("Notifications off");
        }
    });
}

chrome.runtime.onInstalled.addListener(function() {
    /**
     * This will run on first install. Any presets we need to run
     * will live here. Also interesting that sync storage is replicated
     * between chrome instances that the user is signed into.
     */
    chrome.storage.sync.set({send_notifications: true}, function () {
        // We'll set notifications to ON by default
        console.log("Notifications set to: ", true);
    });
});

function checkWindows(windows) {
    // Not sure I'll ever need this, but just in case!
    return windows.length;
}

/**
 * Context Menu is the thing you get when you right-click on a page. We
 * have to set these up to inject into the menu in a later script.
 */
contextMenus.createFirst = 
    chrome.contextMenus.create(
        {
            "title": "Analyze page"
        },
        function (){
            if(chrome.runtime.lastError){
                console.error(chrome.runtime.lastError.message);
            }
        }
    );

contextMenus.filterPage = 
    chrome.contextMenus.create(
        {
            "title": "Filter text"
        },
        function (){
            if(chrome.runtime.lastError){
                console.error(chrome.runtime.lastError.message);
            }
        }
    );

/**
 * This attached the actual code we need to run to the context menu
 * piece of the drop down. When you click the menu item (that we 
 * specified above) this directs that action to the js files that 
 * hold the functionality.
 */
chrome.contextMenus.onClicked.addListener(contextMenuHandler);
function contextMenuHandler(info, tab) {
    if(info.menuItemId===contextMenus.createFirst) {
        // This is where the functionality goes for right-click
        // option. Not sure if we need more than the one function for v1?
        chrome.tabs.executeScript({
            file: 'content/content.js'
        });
    } else if(info.menuItemId===contextMenus.filterPage) {
        // Sends text to backend to filter to high-value
        // sentences
        chrome.tabs.executeScript({
            file: 'content/filter_article.js'
        });
    }
}
// Setup result popup
// Messaging for results popups
chrome.runtime.onMessage.addListener(
    (request, sender, sendResponse) => {
        if (request.type === "setup_result") {
            console.log("getting results setup_result");
            // Lines commented out below would send results into a 
            // seperate window instead of into the popup window, make 
            // your own results.html and see what happens!

            /*
            chrome.tabs.create({
                url: chrome.extension.getURL('results.html'),
                active: false
            }, function(tab) {
            // After the tab has been created, open a window to inject the tab
            chrome.storage.local.set({resultTab: tab.id}, function (res) {});
            chrome.windows.create({
                tabId: tab.id,
                type: 'popup',
                focused: true
                // incognito, top, left, ...
            });
            // save tab.id for next call to populate
            
        });  */
        sendResponse({status: "executed"});
        return true;
    } else if (request.type === "popup_results") {
        console.log("Getting results popup");
        // Save response from api to display in popup
        chrome.storage.local.set({local_data: request.data});

        /* Same story! Uncomment for surprise
        chrome.storage.local.get(['resultTab'], function(results) {
            if (!isInt(results.resultTab)) {
                console.log("something went wrong, no tab saved");
            } else if (isInt(results.resultTab)) {
                console.log(results.resultTab);
                //chrome.runtime.sendMessage({type:"toResults", data: request.data});
                chrome.storage.local.set({local_data: request.data});
            }
        });
        */

        // Badge text shows up on icon
        chrome.browserAction.setBadgeText({text: "New!"});

        // clear any previous alert before creating new one
        chrome.notifications.clear("Article Analyzer", function(wasRem) {}); 
        notify();

        // Nothing listening for this, send for debugging
        sendResponse({status: 'executed2'});
        return true;
    } else if (request.type === "get_results") {
        // Asks for data saved from api request in local storage
        chrome.storage.local.get(['local_data'], function (results) {
            sendResponse(results);
        });
        return true;
    } else if (request.type === "clear_badge") {
        // When a user opens popup, clear badge text. getViews will
        // grab the View of type from the manifest
        var views = chrome.extension.getViews({ type: "popup" });

        // Makes sure this is running as a result of popup opening, 
        // not script setting up popup
        if (views.length > 0) {
            chrome.browserAction.setBadgeText({text: ""});
            sendResponse("Cleared");
        } else {
            sendResponse("Not clearing, page not open");
        }
    } else if (request.type === "set_notifications") {
        // Notification preferences changed
        chrome.storage.sync.set({send_notifications: request.send_notifications});
    } else if (request.type === "get_notification") {
        // Check user preferences for notifications
        chrome.storage.sync.get(["send_notifications"], function (results) {
            //console.log(results.send_notifications);
            sendResponse(results.send_notifications);
        });
        return true;
    }
    return true;
});
