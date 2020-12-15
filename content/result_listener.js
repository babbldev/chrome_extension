/* result_listener.js */
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
    document.getElementById("tickers").innerText = response_json["tickers"];
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