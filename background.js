var contextMenus = {};

function isInt(value) {
    return !isNaN(value) && 
           parseInt(Number(value)) == value && 
           !isNaN(parseInt(value, 10));
}

// Send notification for new analysis
function notify() {
    console.log("In notifs");
    chrome.storage.sync.get(["send_notifications"], function (results) {
        if (results.send_notifications) {
            chrome.notifications.create(
                "Article Analyzer",
                {
                type: "basic",
                iconUrl: "icon.png",
                title: "Article Analysis Complete",
                message: "Click the icon at top to view analysis.",
                },
                function (noteId) {
                    console.log("Notification: ", noteId);
                    console.log(chrome.runtime.lastError);
                }
            );
        } else {
            console.log("Notifications off");
        }
    });
}

chrome.runtime.onInstalled.addListener(function() {
    chrome.storage.sync.set({send_notifications: true}, function () {
        console.log("Notifications set to: ", true);
    });
});

function checkWindows(windows) {
    return windows.length;
}

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
        chrome.storage.local.set({local_data: request.data});
        /*
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
        chrome.browserAction.setBadgeText({text: "New!"});
        // clear any previous alert before creating new one
        chrome.notifications.clear("Article Analyzer", function(wasRem) {}); 
        notify();
        sendResponse({status: 'executed2'});
        return true;
    } else if (request.type === "get_results") {
        chrome.storage.local.get(['local_data'], function (results) {
            sendResponse(results);
        });
        //notify();
        return true;
    } else if (request.type === "clear_badge") {
        var views = chrome.extension.getViews({ type: "popup" });
        if (views.length > 0) {
            console.log("Clearing badge");
            chrome.browserAction.setBadgeText({text: ""});
            sendResponse("Cleared");
        } else {
            sendResponse("Not clearing, page not open");
        }
        
    } else if (request.type === "set_notifications") {
        chrome.storage.sync.set({send_notifications: request.send_notifications});
    } else if (request.type === "get_notification") {
        chrome.storage.sync.get(["send_notifications"], function (results) {
            console.log(results.send_notifications);
            sendResponse(results.send_notifications);
        });
        return true;
    }
    return true;
});


function showResults(results) {
    // Do something, eg..:
    console.log("Loading results into background page");
    document.getElementById("results").innerText = results;
};
