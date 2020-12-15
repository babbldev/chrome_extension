var urls = [];
for(var i = document.links.length; i --> 0;)
    if(document.links[i].hostname === location.hostname)
        urls.push(document.links[i].href);

var url='http://127.0.0.1:8080/api/v1/filter_article';

var jquery = document.createElement('script');
jquery.src = 'https://code.jquery.com/jquery-3.4.1.min.js';
jquery.type = 'text/javascript';
document.getElementsByTagName('head')[0].appendChild(jquery);

// Need storage access to send
chrome.storage.sync.get(['username'], function(results) {
    // Get p's from document, append all text to string
    
    var p_lst = document.getElementsByTagName("p");
    for(i=0;i<p_lst.length;i++) {
        if(p_lst[i].className.length ===0 && p_lst[i].id.length===0){
            //console.log(p_lst[i]);
            var p_txt = p_lst[i].innerText;

            // Setup post request
            var babblHttp = new XMLHttpRequest();
            babblHttp.open("POST", url, false);
            babblHttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            
            var this_data = JSON.stringify({
                "text": p_txt, 
                "url": window.location.href,
                "title": document.title,
                "username": results.username // User has to be signed in
            }); // TODO: figure out how to prompt signin if undefined
            // send <p> off to 
            babblHttp.onreadystatechange = (e) => {
                //console.log(babblHttp.response);
                var jsonResponse = JSON.parse(babblHttp.responseText);
                p_lst[i].innerText = jsonResponse["filtered_text"];
            }
            babblHttp.send(this_data);
        }
    }
});
