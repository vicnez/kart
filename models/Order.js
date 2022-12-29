const mongoose = require('mongoose');

//Order Details
const OrderDetailsSchema = new mongoose.Schema({
    _id : mongoose.Schema.Types.ObjectId,
    user_id: { type: mongoose.Schema.Types.ObjectId, ref:'users' },
    total: { type: Number, default: 0},
    payment_id: { type: mongoose.Schema.Types.ObjectId, ref:'payment_details' },
    customer_address_id: { type: mongoose.Schema.Types.ObjectId, ref:'user_addresses' },
    status: { type: String, default: ''},
    created_date: { type: Date, default: Date.now },
    updated_date: { type: Date, default: Date.now }

});

const OrderDetails = mongoose.model('order_details',OrderDetailsSchema);

//Order Items
const OrderItemsSchema = new mongoose.Schema({
    _id : mongoose.Schema.Types.ObjectId,
    user_id: { type: mongoose.Schema.Types.ObjectId, ref:'users' },
    product_id: { type: mongoose.Schema.Types.ObjectId, ref:'products' },
    order_id: { type: mongoose.Schema.Types.ObjectId, ref:'order_details' },
    product_price: { type: Number },
    customer_address_id: { type: mongoose.Schema.Types.ObjectId, ref:'user_addresses' },
    status: { type: String, default: ''},
    created_date: { type: Date, default: Date.now },
    updated_date: { type: Date, default: Date.now }

});

const OrderItems = mongoose.model('order_items',OrderItemsSchema);

module.exports = {
    OrderDetails,
    OrderItems
};