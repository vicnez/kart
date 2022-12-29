const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    _id : mongoose.Schema.Types.ObjectId,
    user_id: { type: mongoose.Schema.Types.ObjectId, ref:'users' },
    product_id: { type: mongoose.Schema.Types.ObjectId, ref:'products' },
    //discount_id: { type: mongoose.Schema.Types.ObjectId, ref:'product_discount' }, 
    quantity: { type: Number, default: 0 },
    created_date: { type: Date, default: Date.now },
    updated_date: { type: Date, default: Date.now }
});

const Cart = mongoose.model('cart',cartSchema);

module.exports = {
    Cart
};