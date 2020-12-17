/* result_listener.js */

function getTickHTML(tick) {
    var newDiv = document.createElement("div");
    newDiv.classList.add("ticker");
    newDiv.id = tick;
    newDiv.innerText = tick;
    return newDiv
}
var openURL =function () {
    // open url for company?ticker
    var tick = this.getAttribute('id');
    console.log(tick);
    var url = "https://babbl.dev/company?ticker="+tick;
    window.open(url, "_blank");
}

// Runs in popup, displays data from newest request
chrome.runtime.sendMessage({'type': "get_results"}, function (response) {
    var response_json = JSON.parse(response.local_data);
    document.getElementById("filtered_sentences").innerText = response_json["filtered_sents"];

    // Optimism
    document.getElementById("opt").style.width = response_json["optimism"] + "%";
    document.getElementById("opt").innerText += " " + response_json["optimism"] + "%";

    // Pessimism
    document.getElementById("pess").style.width = response_json["pessimism"] + "%";
    document.getElementById("pess").innerText += " " + response_json["pessimism"] + "%";

    // Speculative
    document.getElementById("speculative").style.width = response_json["speculative"] + "%";
    document.getElementById("speculative").innerText += " " + response_json["speculative"] + "%";

    // Reactive
    document.getElementById("reactive").style.width = response_json["reactive"] + "%";
    document.getElementById("reactive").innerText += " " + response_json["reactive"] + "%";

    // Title
    document.getElementById("header").innerText = response_json["title"];

    // Tickers
    //document.getElementById("tickers").innerText = response_json["tickers"];
    for (i=0; i<response_json["tickers"].length && i<8;i++) {
        tick = response_json["tickers"][i];
        var newDiv = getTickHTML(tick);
        newDiv.addEventListener('click', openURL, false);
        document.getElementById("tickers").appendChild(newDiv);
        if (i===0) {
            console.log(getTickHTML(tick));
            console.log(response_json["tickers"].length);
        }
    }
});
chrome.runtime.sendMessage({type: "clear_badge"}, function (response) {});
window.addEventListener('DOMContentLoaded', (e) => {
    chrome.runtime.sendMessage({type:"get_notification"}, function (resp) {
        document.getElementById("togBtn").checked = resp;
    });
    document.getElementById("togBtn").addEventListener("click", (event) => {
        chrome.runtime.sendMessage({type:"set_notifications", send_notifications:document.getElementById("togBtn").checked});
    });
});