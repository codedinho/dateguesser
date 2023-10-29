function showSignupContainer() {
  var menu = document.querySelector('.mobile-menu');
  menu.classList.remove('active');
  document.getElementById("signupContainer").style.display = "block";
  document.getElementById("signinContainer").style.display = "none";
}

function showLoginContainer() {
  var menu = document.querySelector('.mobile-menu');
  menu.classList.remove('active');
  document.getElementById("signupContainer").style.display = "none";
  document.getElementById("signinContainer").style.display = "block";
}

function closeSignupContainer() {
  document.getElementById("signupContainer").style.display = "none";
}

function closeLoginContainer() {
  document.getElementById("signinContainer").style.display = "none";
}

