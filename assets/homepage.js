window.onload = function() {
    var name = "will";
    var host = window.location.hostname;
    console.log(host);
    if (host.startsWith("www.")) {
        host = host.substring(4);
    }
    console.log(host);
    var mail = name + "@" + host;
    document.getElementById("envelope").setAttribute("href", "mailto:" + mail);
    document.getElementById("envelope-text").innerHTML = mail;
}

