const router = require('express').Router();

const req = require('express/lib/request');
var getstatus = require('../common/status');
var status = getstatus.status;
var error = getstatus.error;

var functions = require('../common/functions');

const donenv = require('dotenv').config();

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY) 

//Stripe - Create customer
router.post('/customer/create', async (req, res) => {

    console.log(req.body); 
    var server = {req:req, res:res };
    try {
        const customer = await stripe.customers.create({
            name: req.body.name,
            email: req.body.email
        });

        var api_response = {
            
            result: customer
        };

        var msg = "Stripe customer added successfull";

        status.success(server,api_response, msg); return;
    } catch (error) {
        throw new Error(error);
        //res.status(400).send(error); return;
    }
});


//Stripe - Create carf for customer
router.post('/customer/card/create', async (req, res) => {

    console.log(req.body); 
    var server = {req:req, res:res };

    const { customer_id, card_name, card_ExpYear, card_ExpMonth, card_number, card_cvc } = req.body;
    try {
        /*const card_token = await stripe.tokens.create({
            card: {
                name: card_name,
                number: card_number,
                exp_month: card_ExpMonth,
                exp_year: card_ExpYear,
                cvc: card_cvc
            }
        });

        const card = await stripe.customers.createSource(customer_id, { source: `${card_token.id}`});
        */

        let payment_method = await stripe.paymentMethods.create({
            type: 'card',
            card: {
                number: card_number,
                exp_month: card_ExpMonth,
                exp_year: card_ExpYear,
                cvc: card_cvc
            }
        });
        var api_response = {
            
            card: payment_method.id
        };

        var msg = "Stripe customer card details added successfull";

        status.success(server,api_response, msg); return;
    } catch (error) {
        throw new Error(error);
        //res.status(400).send(error); return;
    }
});



//Stripe - Create Stripe charges
router.post('/customer/charges/create', async (req, res) => {

    console.log(req.body); 
    var server = {req:req, res:res };
    try {
        /*const create_charges = await stripe.charges.create({
            //receipt_email: req.body.email,
            amount: 1000, //100 Rs in INR
            description: "Test Payment from API",
            currency: "INR",
            //card: req.body.card,
            customer: req.body.customer_id,
           //payment_method_types : ['card']
        });
        */

        let paymenyIntent = await stripe.paymentIntents.create({
            payment_method: req.body.card,
            customer: req.body.customer_id,
            amount: Number(req.body.amount)*100,
            description: req.body.description,
            currency: 'inr',
            confirm: true,
            payment_method_types: ['card']
        });

        var api_response = {
            
            result: paymenyIntent
        };

        var msg = "Stripe customer charges/payment intent created successfull";

        status.success(server,api_response, msg); return;
    } catch (error) {
        //throw new Error(error);
        res.status(400).send(error); return;
    }
});

//Stripe customer create (SCC) - Save to DB
router.post("/customer-create", async (req, res) => {

    var server = {req:req, res:res};

    var data = {
        user_id: req.body.user_id,
        customer_id : req.body.customer_id,
        customer_account_type : req.body.customer_account_type,
        customer_email : req.body.customer_email,
        customer_name: req.body.customer_name,
        customer_invoice_prefix: req.body.customer_invoice_prefix,
        status: 'active',
    }

    await functions.stripe_customers(server, data, function(err,result){

        var msg = "Stripe customer added successfull";

        status.success(server,result, msg); return;
        
    });



});

//Stripe customer card create (SCC) - Save to DB
router.post("/customer-card-create", async (req, res) => {

    var server = {req:req, res:res};

    var data = {
        user_id: req.body.user_id,
        customer_id : req.body.customer_id,
        customer_card_id : req.body.customer_card_id,
        status: 'active',
    }

    await functions.stripe_customer_card_create(server, data, function(err,result){

        var msg = "Stripe customer card added successfull";

        status.success(server,result, msg); return;
        
    });



});

//Stripe customer & cards fetch (SCC) - Save to DB
router.get("/customers-cards-info", async (req, res) => {

    var server = {req:req, res:res};

    var data = {
        user_id: req.query.user_id,
    }

    await functions.get_stripe_customers_cards_info(server, data, function(err,result){

        var msg = "Cards list found";

        status.success(server,result, msg); return;
        
    });



});

module.exports = router;
