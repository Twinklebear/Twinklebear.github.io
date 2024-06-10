(function () {
  let name = "will";
  let host = window.location.hostname;
  if (host.startsWith("www.")) {
    host = host.substring(4);
  }
  let mail = name + "@" + host;
  let email_links = document.querySelectorAll("#email-link")
  console.log(email_links);
  for (let i = 0; i < email_links.length; ++i) {
    email_links[i].setAttribute("href", "mailto:" + mail);
  }

  let email_text = document.querySelectorAll("#email-link")
  console.log(email_text);
  for (let i = 0; i < email_text.length; ++i) {
    email_text[i].innerHTML = mail;
  }
})();
