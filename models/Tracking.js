const mongoose = require('mongoose');

const productTrackingSchema = new mongoose.Schema({
    _id : mongoose.Schema.Types.ObjectId,
    user_id: { type: mongoose.Schema.Types.ObjectId, ref:'users' },
    product_id: { type: mongoose.Schema.Types.ObjectId, ref:'products' },
    order_item_id: { type: mongoose.Schema.Types.ObjectId, ref:'order_items' },
    ordered_status: { type: Number, default: 0 },
    shipped_status: { type: Number, default: 0 },
    out_for_delivery_status: { type: Number, default: 0 },
    delivered_status: { type: Number, default: 0 },
    status: { type: String, default: ''},
    created_date: { type: Date, default: Date.now },
    updated_date: { type: Date, default: Date.now }
});

const productTracking = mongoose.model('product_tracking',productTrackingSchema);

module.exports = {
    productTracking
};