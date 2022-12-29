const express = require('express');
const app = express();

const mongoose = require('mongoose');

const donenv = require('dotenv').config();

const bodyparser = require('body-parser');

const STRIPE_PUB_KEY = process.env.STRIPE_PUB_KEY;
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

const configs = require('./common/config');

const { UserNotificationToken } = require('./models/User');

const { product } = require('./models/Product');

const path = require("path");

const cors = require('cors');

var FCM = require('fcm-node');

var serverKey = 'AAAAA6Zo1Ys:APA91bFyfXb_frS3nQUNb5A67kXfd1QpWIA44lsMtm6FXNMnDSwHcMHfCr3q0qks67JCbuZFqbjsdOHY6Vbe3nAEH3jcVZp7vh2iFOUFFgZLohKqIj5I87KnfURDULIe79Q2v4dVuJOC'; //put your server key here

var fcm = new FCM(serverKey);

app.use(cors());

mongoose.connect(process.env.DB_CONNECT, { useNewUrlParser: true }, () => { console.log("DB Connected"); });

//Middleware formdata as json
//app.use(bodyparser.urlencoded({extended:false}));
//app.use(bodyparser.json());
app.use(express.json());

//Import routes
const userRoute = require('./routes/User');
const productRoute = require('./routes/Product');
const cartRoute = require('./routes/Cart');
const stripeRoute = require('./routes/StripeAPI');
const OrderRoute = require('./routes/Order');
const { config } = require('nodemon');
const { TokenExpiredError } = require('jsonwebtoken');


//User Route
app.use('/api/user', userRoute);
app.use('/api/product', productRoute);
app.use('/api/cart', cartRoute);
app.use('/api/stripe',stripeRoute);
app.use('/api/order',OrderRoute);


app.use('/products',express.static(configs.product_img_path));

app.use('/profiles',express.static(configs.user_img_path));

app.set('view engine', 'ejs')

//app.use(require('express-static')('./'));

// app.get('/', (req, res) => {

//     res.render('Home', {
//         key: STRIPE_PUB_KEY
//     });
// });

app.post('/api/send-push-notification', async (req, res) => {

    var user_id = req.body.user_id;

    try {

        const user_notify_token = await UserNotificationToken.find({user_id: mongoose.Types.ObjectId(user_id)});
        console.log(user_notify_token);
        user_notify_token.forEach(result => {
            console.log("*****************");
            console.log(result.token);
            console.log("*****************");
        });
    
        return false;
        

        var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
            to: 'cMk7PJTaM1nkWcmB-ph0P-:APA91bFI2-HLm0NFBm8VcPeQklv1Ojt9D3zfSM08AU5JUKQFAZ3IUVscC0STkqWgAPVLTre4wYrIQ7dIL8ohecsy1m-YFI-H5f44x5ZFNR0LLkyH1RzxBl_Cec12_aw5OJc3WMvtxhVb', 
            //collapse_key: 'your_collapse_key',
            
            notification: {
                title: 'Title of your push notification', 
                body: 'Body of your push notification',
                icon: "firebase-logo.png",
                click_action: "http://localhost:8081" 
            },
            
            // data: {  //you can send only notification or only data(or include both)
            //     my_key: 'my value',
            //     my_another_key: 'my another value'
            // }
        };
        
        fcm.send(message, function(err, response){
            if (err) {
                console.log("Something has gone wrong!");
            } else {
                console.log("Successfully sent with response: ", response);
            }
        });

        

    } catch (err) {
        res.status(400).send(err);
    }

  
});


app.listen(8001, () => { console.log("Server is running on 8001 port"); });

