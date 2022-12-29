const router = require('express').Router();
const mongoose = require('mongoose');
const { Cart } = require('../models/Cart');
const { OrderDetails, OrderItems } = require('../models/Order');
const { PaymentDetails } = require('../models/Payment');
const { productInventory } = require('../models/Product');
const { productTracking } = require('../models/Tracking');
var getstatus = require('../common/status');
var status = getstatus.status;
var error = getstatus.error;

var functions = require('../common/functions');
//const { config } = require('dotenv');
const donenv = require('dotenv');
donenv.config();

const configs = require('../common/config');

const nodemailer = require('nodemailer');
const { User } = require('../models/User');

//Order Summary
router.get('/summary', async (req, res) => {

    var server = {req:req, res:res};

    var user_id = req.query.user_id;

    var data = {
        user_id: user_id
    }

    console.log(data);

    await functions.order_summary(server, data, function(err, result){


        var msg = "Order summary details";

        status.success(server,result, msg); return;

    });

        
});


//Order Payment
router.post('/payment', async (req, res) => {

    var server = {req:req, res:res};

    var user_id = req.body.user_id;
    var card = req.body.card;
    var customer_id = req.body.customer_id;
    var customer_address_id = req.body.customer_address_id;

    var data = {
        user_id: user_id
    }

    console.log(data);

    const userInfo = await User.findOne({_id: mongoose.Types.ObjectId(user_id)});
    //res.send(userInfo); return;
    await functions.order_summary(server, data, async function(err, result){

        //res.send(result); return;
        
        if(result.price_details != null){
            
            var names = '';

            var pname = '';

            var prod_cnt = 0;

            var result_array = result.result;

            var result_inventory_array = result.inventory_details;

            var pdt_html = userInfo.first_name+' '+userInfo.last_name+' <br><div class="container"><div class="row">';
            result_array.forEach(res =>{
                names += res.products.name;
                pname = res.products.name;
                prod_cnt++;
                pdt_html += '<div class="col-sm-3"><img src="'+configs.product_path+res.products.product_image_name+'" width="120" height="100"></div><div class="col-sm-6"> <span>'+res.products.name+' </span> <br><span>Qty: '+res.quantity+' </span> </div><div class="col-sm-3"> <span>Rs. '+res.products.price+'</span> </div>';
            });
            pdt_html += '<br><div><span>Total Amount : '+result.price_details.total_price+'</span></div>';
            pdt_html += '</div> </div>';
            prod_cnt--;
            if(prod_cnt > 0){
                pname = pname + " "+prod_cnt+" more products";
            }
            //res.send(pdt_html); return;
            
            //res.send(result.result[0].products.inventory_id); return;
            //res.send(result); return;

            var data2 = {
                user_id: user_id,
                card: card,
                customer_id: customer_id,
                amount: Math.round(result.price_details.total_price),
                description: names
            };
            
            await functions.stripe_payment_intent_process(server, data2,  async function(err, stripe_payment_result){

                var payDetail = new PaymentDetails({
                    _id: new mongoose.Types.ObjectId(),
                    user_id: user_id,
                    provider: stripe_payment_result.result.payment_method,
                    payment_id: stripe_payment_result.result.id,
                    payment_method: stripe_payment_result.result.payment_method,
                    payment_method_type: stripe_payment_result.result.payment_method_types[0],
                    amount:  stripe_payment_result.result.amount,
                    status: 'success'
                });

                try {
                    const savedpayDetail =  await payDetail.save();

                    var orderDetail = new OrderDetails({
                        _id: new mongoose.Types.ObjectId(),
                        user_id: user_id,
                        total: Math.round(result.price_details.total_price),
                        payment_id: savedpayDetail._id,
                        customer_address_id: customer_address_id,
                        status: 'success',

                    });
                    
                    
                    const savedOrderDetail = await orderDetail.save();

                     result_array.forEach(async res =>{
                        
                        var orderItem = new OrderItems({
                            _id: new mongoose.Types.ObjectId(),
                            user_id: user_id,
                            product_id: res.products._id,
                            order_id: savedOrderDetail._id,
                            product_price: (Number(res.products.price) - Math.round((Number(res.products.price) / 100) * Number(res.product_discount.discount_percentage))) ,
                            customer_address_id: customer_address_id,
                            status: 'success',

                        });

                        const savedorderItem = await orderItem.save();

                        var updateDoc = {
                            $set: { order_id: savedOrderDetail._id }
                        };

                        await PaymentDetails.updateOne({_id: mongoose.Types.ObjectId(savedpayDetail._id)}, updateDoc, {});

                        const removeCartItems =  await Cart.deleteMany({user_id: mongoose.Types.ObjectId(user_id)});

                        result_inventory_array.forEach(async res2 => {
                            console.log(res2.quantity+"-"+res2.tot_qty+"-"+res2.inventory_id);
                            let remaining_qty = res2.tot_qty - res2.quantity;
                            console.log(remaining_qty);
            
                            var upt_data = { $set: {quantity: remaining_qty} };
            
                            const inventoryUpt = await productInventory.updateOne({_id: mongoose.Types.ObjectId(res2.inventory_id)}, upt_data);
            
                        });

                        var prodTrackInfo = new productTracking({
                            _id: new mongoose.Types.ObjectId(),
                            user_id: user_id,
                            product_id: res.products._id,
                            order_item_id: savedorderItem._id,
                            ordered_status: 1,
                            shipped_status: 0,
                            out_for_delivery_status: 0,
                            delivered_status: 0,
                            status: 'active',
                        });

                        await prodTrackInfo.save();

                        var data3 = {
                            user_id: user_id,
                            title: "EKART APP",
                            body: pname
                        };

                        // await functions.product_status_notification(server, data3, async function(err, prod_notify_result){

                            // let mailTransporter = nodemailer.createTransport({
                            //     service: 'gmail',
                            //     auth: {
                            //         user: process.env.GMAIL_AUTH_EMAIL,
                            //         pass: process.env.GMAIL_AUTH_PWD
                            //     }
                            // });
    
                            // let mailDetails = {
                            //     from: process.env.GMAIL_AUTH_EMAIL,
                            //     to: userInfo.email_address,
                            //     subject: 'Ekart -  Your Order has been successfully placed',
                            //     html: pdt_html
                            // };
    
                            // mailTransporter.sendMail(mailDetails, function(err, data) {
                            //     if(err) {
                            //         res.staus(400).send(err);  return;
                            //     }else{
                            //         var msg = "Your Order has been placed successfully";
    
                            //         status.success(server,savedOrderDetail, msg); return;
                            //     }
                            // });

                        // });

                        var msg = "Your Order has been placed successfully";
    
                        status.success(server,savedOrderDetail, msg); return;

                        
            
                    });

                } catch (err) {
                    console.log(err);
                    res.status(400).send(err); return;
                }
                


            });

            

        }else{
            error.order_failed(server); return;
        }        

    });
 
});


//Order Details
router.get('/details', async (req, res) => {

    var server = {req:req, res:res};

    var user_id = req.query.user_id;

    const result = await OrderItems.aggregate([
        {
            $match: {
                user_id: mongoose.Types.ObjectId(user_id)
            }
        },
        //products 
        {   $lookup:
            {
              from: 'products',
              localField: 'product_id',
              foreignField: '_id',
              as: 'products'
            }
        },
         //product tracking
         {   $lookup:
            {
              from: 'product_trackings',
              localField: 'product_id',
              foreignField: 'product_id',
              as: 'tracking'
            }
        },
        {
            $project: { _id:1, user_id:1, product_id:1, order_id:1, status:1, product_price:1, products: { $arrayElemAt: [ "$products", 0 ]},
            tracking: { $arrayElemAt: [ "$tracking", 0 ]}
            }
           
            
        }
    ]);

    console.log(result);
    //res.send(result); return;

    if(result.length > 0){
        var api_response = {
            total_records: result.length,
            result: result
        };
        var msg = "Order details found";

        status.success(server,api_response,msg); return;
    }else{
        status.no_record(server); return;
    }

        
});

module.exports = router;