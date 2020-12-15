// Setup XMLHttp request
var babblHttp = new XMLHttpRequest();
var url='https://babbl.dev/api/v1/add_article';

// Setup post request
babblHttp.open("POST", url);
babblHttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

// Get <p>'s from document, append all text p_txt
var p_lst = document.getElementsByTagName("p");
var p_txt = "";
for(i=0;i<p_lst.length;i++) {
    if(p_lst[i].className.length ===0){
        p_txt += p_lst[i].innerText + " // "; // Divider for backend handling
    }
}

babblHttp.onreadystatechange = (e) => {
    if(babblHttp.readyState === XMLHttpRequest.DONE) {
        var resp = babblHttp.responseText;
        chrome.runtime.sendMessage({type:'setup_result'}, function(response) {
            if (response.status == "executed") {
                chrome.runtime.sendMessage({type:'popup_results', data:resp});
            }
        });
    }
}

// Need storage access to send
chrome.storage.sync.get(['username'], function(results) {
    babblHttp.send(JSON.stringify(
    {
    "text": p_txt, 
    "url": window.location.href,
    "title": document.title,
    "username": results.username // User has to be signed in
    })); 
});