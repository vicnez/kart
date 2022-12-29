const mongoose = require('mongoose');

// creating category schema
const productCategorySchema = new mongoose.Schema({
    _id : mongoose.Schema.Types.ObjectId,
    name: { type: String, trim: true },
    description: { type: String, trim: true },
    status: { type: String, default: ''},
    created_date: { type: Date, default: Date.now },
    updated_date: { type: Date, default: Date.now }
});

//Creating product category model object
const productCategory = mongoose.model('product_category', productCategorySchema);

// creating sub category schema
const productSubCategorySchema = new mongoose.Schema({
    _id : mongoose.Schema.Types.ObjectId,
    category_id: { type: mongoose.Schema.Types.ObjectId, ref:'product_category' },
    name: { type: String, trim: true },
    description: { type: String, trim: true },
    status: { type: String, default: ''},
    created_date: { type: Date, default: Date.now },
    updated_date: { type: Date, default: Date.now }
});

//Creating product category model object
const productSubCategory = mongoose.model('product_sub_category', productSubCategorySchema);


// creating inventory schema
const productInventorySchema = new mongoose.Schema({
    _id : mongoose.Schema.Types.ObjectId,
    quantity: { type: Number, default: 0 },
    status: { type: String, default: ''},
    created_date: { type: Date, default: Date.now },
    updated_date: { type: Date, default: Date.now }
});

//Creating product category model object
const productInventory = mongoose.model('product_inventory', productInventorySchema);

// creating discount schema
const productDiscountSchema = new mongoose.Schema({
    _id : mongoose.Schema.Types.ObjectId,
    name: { type: String, trim: true },
    description: { type: String, trim: true },
    discount_percentage: { type: Number },
    status: { type: String, default: ''},
    created_date: { type: Date, default: Date.now },
    updated_date: { type: Date, default: Date.now }
});

//Creating product discount model object
const productDiscount = mongoose.model('product_discount', productDiscountSchema);

//product create schema
const productSchema = new mongoose.Schema({
    _id : mongoose.Schema.Types.ObjectId,
    name: { type: String, trim: true },
    description: [{ type: String, trim: true }],
    sku: { type: String, trim: true },
    category_id: { type: mongoose.Schema.Types.ObjectId, ref:'product_category' },
    sub_category_id: { type: mongoose.Schema.Types.ObjectId, ref:'product_sub_category' },
    inventory_id: { type: mongoose.Schema.Types.ObjectId, ref:'product_inventory' },
    discount_id: { type: mongoose.Schema.Types.ObjectId, ref:'product_discount' }, 
    price: { type: Number },
    brand: { type: String, trim: true },
    product_image_path: { type: String, default: '' },
    product_image_name: { type: String, default: '' },
    storage: { type: String, default: '' },
    ram: { type: String, default: '' },
    color: { type: String, default: '' },
    model_no: { type: String, default: '' },
    created_date: { type: Date, default: Date.now },
    updated_date: { type: Date, default: Date.now }
});

//Creating product model object
const product = mongoose.model('products', productSchema);


module.exports = {
    productCategory,
    productSubCategory,
    productInventory,
    productDiscount,
    product
};