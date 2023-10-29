// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-auth.js";
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

var firstname =document.getElementById("firstname")
var lastname =document.getElementById("lastname")
var email =document.getElementById("email")
var password =document.getElementById("password")

window.signup = function (e) {
  e.preventDefault();

  var firstnameValue = firstname.value.trim();
  var lastnameValue = lastname.value.trim();
  var emailValue = email.value.trim();
  var passwordValue = password.value.trim();

  // Check if any of the fields are empty
  if (firstnameValue === "" || lastnameValue === "" || emailValue === "" || passwordValue === "") {
    return;
  }

  var obj = {
    firstname: firstnameValue,
    lastname: lastnameValue,
    email: emailValue,
    password: passwordValue
  };

  createUserWithEmailAndPassword(auth, obj.email, obj.password)
  .then(function (userCredential) {
    var userId = userCredential.user.uid;
    // Get a reference to the user's data in the database using the generated user ID
    const userRef = ref(database, 'users/' + userId);

    // Update user's data in the database
    set(userRef, {
        firstname: obj.firstname,
        lastname: obj.lastname,
        email: obj.email,
        // other fields you want to update
    })
    .then(() => {
        console.log("User information updated successfully!");
        // Call a function to update the leaderboard
        updateLeaderboard();
        closeSignupContainer();
    })
    .catch((error) => {
        console.error("Error updating user information: ", error);
    });
})
.catch(function (err) {
    alert("Error: " + err.message);
});
}
