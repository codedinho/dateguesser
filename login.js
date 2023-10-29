// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-analytics.js";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBRhs0EDZZ0bB4E9nmU0i5X45Itrs4VjgU",
  authDomain: "guess-masters-db.firebaseapp.com",
  databaseURL: "https://guess-masters-db-default-rtdb.firebaseio.com",
  projectId: "guess-masters-db",
  storageBucket: "guess-masters-db.appspot.com",
  messagingSenderId: "216367548751",
  appId: "1:216367548751:web:b8b488981186ecd1a51d3a",
  measurementId: "G-RP0GWRD7S8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const auth = getAuth();

var email =document.getElementById("email")
var password =document.getElementById("password")

window.login = function (e) {
    e.preventDefault();
    var obj = {
        email: email.value,
        password: password.value
    };

    signInWithEmailAndPassword(auth, obj.email, obj.password)
        .then(function (userCredential) {
            var user = userCredential.user;
            var userId = user.uid;
            console.log("User logged in:", user);
            closeLoginContainer();
        })
        .catch(function (error) {
            console.error("Login error:", error.message);
        });

    console.log(obj);
};
