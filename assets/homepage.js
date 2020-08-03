window.onload = function() {
    var name = "will";
    var mail = name + "@" + window.location.hostname;
    document.getElementById("envelope").setAttribute("href", "mailto:" + mail);
    document.getElementById("envelope-text").innerHTML = mail;
}

