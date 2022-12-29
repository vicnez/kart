const mongoose = require('mongoose');

//creating stripe customer schema
const customerSchema = new mongoose.Schema({
    _id : mongoose.Schema.Types.ObjectId,
    user_id: { type: mongoose.Schema.Types.ObjectId, ref:'users' },
    customer_id : { type: String, trim: true },
    customer_account_type : { type: String, trim: true },
    customer_email : { type: String, trim: true },
    customer_name: { type: String, trim: true },
    customer_invoice_prefix: { type: String, trim: true },
    status: { type: String },
    created_date: { type: Date, default: Date.now },
    updated_date: { type: Date, default: Date.now }
});

//Creating stripe customer model object
const Customer = mongoose.model('stripe_customers', customerSchema);

const customerCardSchema = new mongoose.Schema({
    _id : mongoose.Schema.Types.ObjectId,
    user_id: { type: mongoose.Schema.Types.ObjectId, ref:'users' },
    customer_id: { type: mongoose.Schema.Types.ObjectId, ref:'stripe_customers' },
    customer_card_id : { type: String, trim: true },
    status: { type: String },
    created_date: { type: Date, default: Date.now },
    updated_date: { type: Date, default: Date.now }
});

//Creating stripe customer card model object
const CustomerCard = mongoose.model('stripe_customer_cards', customerCardSchema);



const customerPaymentIntentInfoSchema = new mongoose.Schema({
    _id : mongoose.Schema.Types.ObjectId,
    user_id: { type: mongoose.Schema.Types.ObjectId, ref:'users' },
    customer_payment_intent_id: { type: String, trim: true },
    customer_amount: { type: Number, default: 0},
    created_date: { type: Date, default: Date.now },
    updated_date: { type: Date, default: Date.now }
});

//Creating stripe customer payment intent info model object
const CustomerPaymentIntentInfo = mongoose.model('stripe_customer_payments_info', customerPaymentIntentInfoSchema);

module.exports = {
    Customer,
    CustomerCard,
    CustomerPaymentIntentInfo
}