/**
 * @Author: John Isaacs <john>
 * @Date:   27-Feb-172017
 * @Filename: auth.js
* @Last modified by:   john
* @Last modified time: 09-Mar-172017
 */



var config = {
    apiKey: "AIzaSyBQpfz-F4H8EcQXFmXSjVFCWcLJR3znVtM",
    authDomain: "envirocache-232c1.firebaseapp.com",
    databaseURL: "https://envirocache-232c1.firebaseio.com",
    storageBucket: "envirocache-232c1.appspot.com",
    messagingSenderId: "241058341316"
};
firebase.initializeApp(config);

// Get a reference to the database service
var database = firebase.database();

function login(email, password) {
    firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        console.log(error.code + ":" + error.message)

        // ...
    });
}
var name, email, photoUrl, emailVerified, uid;

firebase.auth().onAuthStateChanged(function(user) {
    if (user) {

        // User is signed in.
        $(".content").show();

        name = user.displayName;
        email = user.email;
        photoUrl = user.photoURL;
        emailVerified = user.emailVerified;
        uid = user.uid;
        if (name == "null") {
            name = email;
        }
        $(".signin").hide();
        processUser(user);

        $("#welcome").text("Hello " + name);
        $("#welcomep").text("Thanks for loging in, you can now add Routes, Badges and look at the leaderboards");

    } else {
        $(".signin").show();
        // No user is signed in.
        $(".content").hide();
        $("#welcome").text("Welcome to Envirocache");
        $("#welcomep").text("You need to login to use this site");
    }
});

var provider = new firebase.auth.GoogleAuthProvider();
//provider.addScope('https://www.googleapis.com/auth/plus.login');
$("#signin").click(function(email, password) {
    login($("#email").val(), $("#password").val());
})
$("#signout").click(function(email, password) {
    firebase.auth().signOut().then(function() {
        // Sign-out successful.
    }, function(error) {
        // An error happened.
    });
})

$("#signingoogle").click(function() {
    console.log("here");
    firebase.auth().signInWithPopup(provider).then(function(result) {
        // This gives you a Google Access Token. You can use it to access the Google API.
        var token = result.credential.accessToken;
        // The signed-in user info.
        var user = result.user;
        console.log("heres jonney");
        // ...
    }).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;
        console.log(error.code + ":" + error.message + ":" + error.credential + ":" + error.email)
            // ...
    });
})

function processUser(user) {
    var username;
    var userId = firebase.auth().currentUser.uid;
    firebase.database().ref('/users/' + userId).once('value').then(function(snapshot) {
      if(snapshot.val()){
        username = snapshot.val().username;
      }
      if (!username) {
          $("#myModalUser").modal("show");
      }

        // ...
    });

}
$("#user-submit").click(function(){
    var updates = {};
    updates['/users/' + uid] = {
        "username": $("#username").val(),
        "type":"player",
        "score": 0,
        "badgeswon":{}
    };
    firebase.database().ref().update(updates);
      $("#myModalUser").modal("hide");
});
