const mongoose = require('mongoose');
const { Customer, CustomerCard } = require('../models/Stripe');
const { Cart } = require('../models/Cart');
const { UserNotificationToken} = require('../models/User');
var getstatus = require('./status');
var status = getstatus.status;
var error = getstatus.error;

var FCM = require('fcm-node');

var serverKey = 'AAAAA6Zo1Ys:APA91bFyfXb_frS3nQUNb5A67kXfd1QpWIA44lsMtm6FXNMnDSwHcMHfCr3q0qks67JCbuZFqbjsdOHY6Vbe3nAEH3jcVZp7vh2iFOUFFgZLohKqIj5I87KnfURDULIe79Q2v4dVuJOC'; //put your server key here

var fcm = new FCM(serverKey);

const donenv = require('dotenv').config();

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); 


var basic_functions = {
    stripe_customers: async function(server, data, callback){

        const cust = new Customer({
            _id: new mongoose.Types.ObjectId(),
            user_id: data.user_id,
            customer_id: data.customer_id,
            customer_account_type: data.customer_account_type,
            customer_email: data.customer_email,
            customer_name: data.customer_name,
            customer_invoice_prefix: data.customer_invoice_prefix,
            status: data.active
        });

        try {
            const savedCust = await cust.save();
        var api_response = {
            _id: savedCust._id,
            result: savedCust
        }
        
        console.log(api_response);
        callback(0,api_response);
        
        } catch (err) {
            error.insert_error(server);	return;
        }

                
    },

    stripe_customer_card_create: async function(server, data, callback){

        const custCard = new CustomerCard({
            _id: new mongoose.Types.ObjectId(),
            user_id: data.user_id,
            customer_id: data.customer_id,
            customer_card_id: data.customer_card_id,
            status: data.active
        });

        try {
            const savedCustCard = await custCard.save();
        var api_response = {
            _id: savedCustCard._id,
            result: savedCustCard
        }
        
        console.log(api_response);
        callback(0,api_response);
        
        } catch (err) {
            error.insert_error(server);	return;
        }
    },

    get_stripe_customers_cards_info: async function(server, data, callback){

        try {
            
            const result = await CustomerCard.aggregate([

                {
                    $match: {
                        user_id: mongoose.Types.ObjectId(data.user_id)
                    }
                },
    
                {
                    $lookup:
                    {
                        from: 'stripe_customers',
                        localField: 'customer_id',
                        foreignField: '_id',
                        as: 'customersinfo'
                    }
                },
                {
                    $project: {
                        _id: 1,
                        customer_card_id: 1,
                        customersinfo: { $arrayElemAt: [ "$customersinfo", 0 ]}
                    }
                },
                { $sort : { _id : -1 } } 
            ]);
    
            console.log(result);
    
            if(result.length > 0){
                var api_response = {
                    result: result
                };
    
                callback(0, api_response);
    
            }else{
                status.no_record(server); return;
            }
        } catch (err) {
            status.no_record(server); return;
        }

        

        
    },

    order_summary: async function(server, data, callback){


        console.log(data.user_id);

        try {

            const result = await Cart.aggregate([
    
                {
                    $match:
                    {
                        user_id: mongoose.Types.ObjectId(data.user_id)
                    }
                },
        
                {
                    $lookup:
                    {
                        from: 'products',
                        localField: 'product_id',
                        foreignField: '_id',
                        as: 'products'
                    }
                },
                {
                    $lookup:
                    {
                        from: 'product_discounts',
                        localField: 'products.discount_id',
                        foreignField: '_id',
                        as: 'product_discount'
                    }
                },
                {
                    $lookup:
                    {
                        from: 'product_inventories',
                        localField: 'products.inventory_id',
                        foreignField: '_id',
                        as: 'product_inventory'
                    }
                },
                // {
                //     $lookup:
                //     {
                //         from: 'users',
                //         localField: 'user_id',
                //         foreignField: '_id',
                //         as: 'user_info'
                //     }
                // },
                {
                    $project:
                    {
                        _id: 1,
                        quantity: 1,
                        products: { $arrayElemAt: ["$products", 0]},
                        product_discount: { $arrayElemAt: ["$product_discount", 0]},
                        product_inventory: { $arrayElemAt: ["$product_inventory", 0]},
                        //user_info: { $arrayElemAt: ["$user_info", 0]}
                    }
                }
            ]);
        
            if(result.length > 0){
        
                var tot_price = 0, tot_qty = 0, tot_price_nodiscnt = 0, tot_discnt = 0;
                var qty_info_arr = [];
                result.forEach(res =>{
                    var prod_qty = res.quantity;
                    var prod_discount = res.product_discount.discount_percentage;
                    var prod_price = (res.products.price);
                    console.log("********************");
                    console.log("Quantity : ",prod_qty);
                    console.log("Price : ",prod_price);
                    console.log("Discount : ",prod_discount);
                    console.log("********************");
        
                    tot_qty += prod_qty;
        
                    
        
                    var discnt = ((prod_price/100)*prod_discount);
        
                    discnt = discnt * prod_qty;
        
                    var price = prod_price * prod_qty;
        
                    tot_price_nodiscnt += price;
        
                    console.log("Discount price :", discnt);
        
                    tot_discnt +=  discnt;
        
                    console.log("Price :", price);
        
                    var final_price = price - discnt;
        
                    console.log("Final price : ", final_price);
        
                    tot_price += final_price;

                    var invt_details_row = {quantity: prod_qty, tot_qty: res.product_inventory.quantity, inventory_id: res.products.inventory_id, product_id: res.products._id};
                    qty_info_arr.push(invt_details_row);
                });
        
                console.log("Total price : ", tot_price);
        
                var price_details = { price: tot_price_nodiscnt, discount: tot_discnt, quantities:tot_qty, total_price: tot_price };
        
        
                var api_response = {
                    result: result,
                    price_details: price_details,
                    inventory_details: qty_info_arr
                };
                callback(0, api_response);
        
            }else{
                status.no_record(server); return;
            }
            
        } catch (err) {
            status.no_record(server); return;
        }
    },

    stripe_payment_intent_process: async function(server, data, callback){

        console.log(data); 

        //console.log(process.env.STRIPE_SECRET_KEY); return;

        try {

            
            const paymenyIntent = await stripe.paymentIntents.create({
                payment_method: data.card,
                customer: data.customer_id,
                amount: Number(data.amount)*100,
                description: data.description,
                currency: 'inr',
                confirm: true,
                payment_method_types: ['card'],
            });
    
            var api_response = {
                
                result: paymenyIntent
            };
    
            //var msg = "Stripe customer charges/payment intent created successfull";
    
            callback(0, api_response);

        } catch (err) {

            console.log(err); 
            //throw new Error(error);
            server.res.status(400).send(err); return;
        }

    },

    product_status_notification: async function(server, data, callback){

        var user_id = data.user_id;

        try {
            
            const user_notify_token = await UserNotificationToken.find({user_id: mongoose.Types.ObjectId(user_id)});
            console.log(user_notify_token);
            user_notify_token.forEach(result => {
                console.log("*****************");
                console.log(result.token);
                var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
                    //to: 'cMk7PJTaM1nkWcmB-ph0P-:APA91bFI2-HLm0NFBm8VcPeQklv1Ojt9D3zfSM08AU5JUKQFAZ3IUVscC0STkqWgAPVLTre4wYrIQ7dIL8ohecsy1m-YFI-H5f44x5ZFNR0LLkyH1RzxBl_Cec12_aw5OJc3WMvtxhVb', 
                    //collapse_key: 'your_collapse_key',
                    to: result.token,
                    notification: {
                        title: data.title, 
                        body: data.body,
                        icon: data.icon,
                        //click_action: "http://localhost:8081" 
                    },
                    
                    // data: {  //you can send only notification or only data(or include both)
                    //     my_key: 'my value',
                    //     my_another_key: 'my another value'
                    // }
                };
                
                 fcm.send(message, function(err, response){
                    if (err) {
                        console.log("Something has gone wrong!", err);
                        //callback(0, err);
                    } else {
                        console.log("Successfully sent with response: ", response);
                        //callback(0, response);
                    }
                });
        
                console.log("*****************");
            });

            
            callback(0, "success - push notify");            
    
        } catch (err) {
            console.log(err); 
            //throw new Error(error);
            server.res.status(400).send(err); return;
        }

    }


};

module.exports = basic_functions;