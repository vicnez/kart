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
firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();


$("#notification_subscribe").on("click", function () {
    browserpermission();
});



$(".enable_ekart_notification_never_ask").on("click", function () {
    document.cookie = "permissions=never_ask";
    $(".notification_subscribe_cls").hide();
});
//alert(Notification.permission);
if (Notification.permission !== 'denied' || Notification.permission !== 'granted') {
    $(".notification_subscribe_cls").hide();
}
if (Notification.permission == 'default') {
    $(".notification_subscribe_cls").show();
}
function browserpermission() {
    if (Notification.permission !== 'denied' && Notification.permission !== 'granted' || Notification.permission === "default") {
        messaging.requestPermission().then(function () {
            //getToken(messaging);
            return messaging.getToken();
        }).then(function (token) {
            console.log(token);
            if (Notification.permission == 'granted') {
                $(".notification_subscribe_cls").hide();
            }
            $.ajax({
                url: ajax_url + "/notification_token_create",
                type: "POST",
                cache: false,
                data: {browser_token: token},
                success: function (data) {
                    console.log(data);
                }
            });
        }).catch(function (err) {
            $(".notification_subscribe_cls").hide();
            console.log('Permission denied', err);
        });
    }
}

messaging.onMessage(function (payload) {
    console.log('onMessage: ', payload);
});