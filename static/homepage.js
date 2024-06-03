$(document).ready(function () {
  console.log("ok");
  var name = "will";
  var host = window.location.hostname;
  if (host.startsWith("www.")) {
    host = host.substring(4);
  }
  var mail = name + "@" + host;
  document.getElementById("envelope").setAttribute("href", "mailto:" + mail);
  document.getElementById("envelope-text").innerHTML = mail;
});
