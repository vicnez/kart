importScripts("https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js");

// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyB1VNl4QPTrr4UqBoYW01AKoSyE1b6bjYk",
    authDomain: "ekart-app-ec228.firebaseapp.com",
    projectId: "ekart-app-ec228",
    storageBucket: "ekart-app-ec228.appspot.com",
    messagingSenderId: "15676790155",
    appId: "1:15676790155:web:b55b973939d57245f38b8e",
    measurementId: "G-8BSX6JQ9LP"
  };
  
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  
  const messaging = firebase.messaging();

  