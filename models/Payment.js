const mongoose = require('mongoose');

const PaymentDetailsSchema = new mongoose.Schema({
    _id : mongoose.Schema.Types.ObjectId,
    user_id: { type: mongoose.Schema.Types.ObjectId, ref:'users' },
    order_id: { type: mongoose.Schema.Types.ObjectId, ref:'order_details' },
    provider: { type: String, trim: true},
    payment_id: { type: String, trim: true},
    payment_method: { type: String, trim: true},
    payment_method_type: { type: String, trim: true},
    amount: { type: Number, default: 0},
    status: { type: String, default: ''},
    created_date: { type: Date, default: Date.now },
    updated_date: { type: Date, default: Date.now }
});

const PaymentDetails = mongoose.model('payment_details', PaymentDetailsSchema);

module.exports = {
    PaymentDetails
};