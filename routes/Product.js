const router = require('express').Router();
const { productCategory, productInventory, productDiscount, product, productSubCategory } = require('../models/Product');
const mongoose = require('mongoose');
var getstatus = require('../common/status');
var status = getstatus.status;
var error = getstatus.error;

const config = require('../common/config');

var functions = require('../common/functions');

var randomstring = require("randomstring");

const multer = require('multer');

const path = require('path');

const fs = require('fs');

const { productTracking } = require('../models/Tracking');

//split - this method returns string into an array of substring or this method returns new array
//slice - it returns extracted part  in a new string
//join - it returns an array as a string / array to string
const storage = multer.diskStorage({
    destination: config.product_img_upload_path,
    filename: (req, file, callback) => {
        return callback(null,`${file.originalname.split('.').slice(0, -1).join('.')}_${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage:storage
});

//category create
router.post('/category/create', async (req, res) => {
    var server = { req: req, res: res };

    var name = req.body.name;
    var description = req.body.description;

    if(typeof(name)=='undefined'){
        error.param_required(server,'name parameter required','name'); return;
    }

    if((name).trim()==''){
        error.required(server,'name is required'); return;
    }

    if(typeof(description)=='undefined'){
        error.param_required(server,'description parameter required','description'); return;
    }

    if((description).trim()==''){
        error.required(server,'description is required'); return;
    }

    //Check if the user is already in the database
    const categoryExist = await productCategory.findOne({name:name});
    if(categoryExist) return status.conflict(server);

    const prodCategory = new productCategory({
        _id: new mongoose.Types.ObjectId(),
        name: name,
        description: description,
        status: 'active'
    });

    try {
        const savedprodCategory =  await prodCategory.save();
    
        var api_response = {
            _id: savedprodCategory._id,
            result: savedprodCategory
        };

        var msg = "Product category added successfull";

        status.success(server,api_response,msg); return;
    
    } catch (err) {
        res.status(400).send(err); return;
    }




});


//category update
router.put('/category/update', async (req, res) => {
    var server = { req: req, res: res };

    var id = req.body.id;
    var name = req.body.name;
    var description = req.body.description;
    var category_status = req.body.category_status;

    if(typeof(id)=='undefined'){
        error.param_required(server,'id parameter required','id'); return;
    }

    if((id).trim()==''){
        error.required(server,'id is required'); return;
    }

    if(typeof(name)=='undefined'){
        error.param_required(server,'name parameter required','name'); return;
    }

    if((name).trim()==''){
        error.required(server,'name is required'); return;
    }

    if(typeof(description)=='undefined'){
        error.param_required(server,'description parameter required','description'); return;
    }

    if((description).trim()==''){
        error.required(server,'description is required'); return;
    }

    if(typeof(category_status)=='undefined'){
        error.param_required(server,'category status parameter required','category_status'); return;
    }

    if((category_status).trim()==''){
        error.required(server,'category status is required'); return;
    }


    try {
        
        var prod_category_upt = { $set: {name: name, description:description, status: category_status}};

        const uptProdCategory = await productCategory.updateOne({_id:mongoose.Types.ObjectId(id)}, prod_category_upt);
    
        var api_response = {
            result: uptProdCategory
        };

        var msg = "Product category updated successfully";

        status.success(server,api_response,msg); return;
    
    } catch (err) {
        res.status(400).send(err); return;
    }

});

//category delete
router.delete("/category/delete", async(req, res) => {

    var server = { req:req, res:res };

    var id = req.body.id;

    if(typeof(id)=='undefined'){
        error.param_required(server,'id parameter required','id'); return;
    }

    if((id).trim()==''){
        error.required(server,'id is required'); return;
    }

    try {
        
        const deleteProdCategory =  await productCategory.deleteOne({_id: mongoose.Types.ObjectId(id)});

        var api_response = {
            result: deleteProdCategory
        };

        var msg = "Product category deleted successfull";

        status.success(server,api_response,msg); return;

    } catch (err) {
        res.status(400).send(err); return;
    }

});

//sub category create
router.post('/sub-category/create', async (req, res) => {
    var server = { req: req, res: res };

    var category_id = req.body.category_id;
    var name = req.body.name;
    var description = req.body.description;

    if(typeof(category_id)=='undefined'){
        error.param_required(server,'category id parameter required','category_id'); return;
    }

    if((category_id).trim()==''){
        error.required(server,'category id is required'); return;
    }

    if(typeof(name)=='undefined'){
        error.param_required(server,'name parameter required','name'); return;
    }

    if((name).trim()==''){
        error.required(server,'name is required'); return;
    }

    if(typeof(description)=='undefined'){
        error.param_required(server,'description parameter required','description'); return;
    }

    if((description).trim()==''){
        error.required(server,'description is required'); return;
    }

    //Check if the product sub category is already in the database
    const subCategoryExist = await productSubCategory.findOne({name:name});
    if(subCategoryExist) return status.conflict(server);

    const prodSubCategory = new productSubCategory({
        _id: new mongoose.Types.ObjectId(),
        category_id: category_id,
        name: name,
        description: description,
        status: 'active'
    });

    try {
        const savedprodSubCategory =  await prodSubCategory.save();
    
        var api_response = {
            _id: savedprodSubCategory._id,
            result: savedprodSubCategory
        };

        var msg = "Product sub category added successfull";

        status.success(server,api_response,msg); return;
    
    } catch (error) {
        res.status(400).send(error); return;
    }


});

//sub category update
router.put('/sub-category/update', async (req, res) => {
    var server = { req: req, res: res };

    var id = req.body.id;
    var category_id = req.body.category_id;
    var name = req.body.name;
    var description = req.body.description;
    var sub_category_status = req.body.sub_category_status;

    if(typeof(id)=='undefined'){
        error.param_required(server,'id parameter required','id'); return;
    }

    if((id).trim()==''){
        error.required(server,'id is required'); return;
    }

    if(typeof(category_id)=='undefined'){
        error.param_required(server,'category id parameter required','category_id'); return;
    }

    if((category_id).trim()==''){
        error.required(server,'category id is required'); return;
    }

    if(typeof(name)=='undefined'){
        error.param_required(server,'name parameter required','name'); return;
    }

    if((name).trim()==''){
        error.required(server,'name is required'); return;
    }

    if(typeof(description)=='undefined'){
        error.param_required(server,'description parameter required','description'); return;
    }

    if((description).trim()==''){
        error.required(server,'description is required'); return;
    }

    if(typeof(sub_category_status)=='undefined'){
        error.param_required(server,'sub category status parameter required','sub_category_status'); return;
    }

    if((sub_category_status).trim()==''){
        error.required(server,'sub category status is required'); return;
    }
    

    try {

        var upt_prod_sub_category = { $set : { name: name, description: description, status: sub_category_status }};
        
        console.log(upt_prod_sub_category);


        const uptprodSubCategory =  await productSubCategory.updateOne({_id: mongoose.Types.ObjectId(id)}, upt_prod_sub_category);
    
        var api_response = {
            result: uptprodSubCategory
        };

        var msg = "Product sub category updated successfull";

        status.success(server, api_response, msg); return;
    
    } catch (err) {
        res.status(400).send(err); return;
    }


});

// sub category delete
router.delete("/sub-category/delete", async (req, res) => {

    var server = {req:req, res:res};

    var id = req.body.id;

    if(typeof(id)=='undefined'){
        error.param_required(server,'id parameter required','id'); return;
    }

    if((id).trim()==''){
        error.required(server,'id is required'); return;
    }

    try {
        
        const deleteProdSubCategory = await productSubCategory.deleteOne({_id: mongoose.Types.ObjectId(id)});

        var api_response = {
            result: deleteProdSubCategory
        };

        var msg = "Product category deleted successfull";

        status.success(server,api_response,msg); return;

    } catch (err) {
        
        res.status(400).send(err); return;

    }

});

//inventory create
router.post('/inventory/create', async (req, res) => {

    var server = { req: req, res: res };

    var inventory = req.body.inventory;
    inventory = parseInt(inventory);

    if(typeof(inventory)=='undefined'){
        error.param_required(server,'inventory parameter required','inventory'); return;
    }

    if(!Number(inventory)){
        error.required(server,'inventory field must be number'); return;
    }

    console.log(inventory);

    const prodInventory = new productInventory({
        _id: new mongoose.Types.ObjectId(),
        quantity: inventory,
        status: 'active'
    });

    try {
        const savedprodInventory =  await prodInventory.save();
    
        var api_response = {
            _id: savedprodInventory._id,
            result: savedprodInventory
        };

        var msg = "Product inventory added successfull";

        status.success(server,api_response,msg); return;
    
    } catch (err) {
        res.status(400).send(err); return;
    }




});

//inventory update
router.put('/inventory/update', async (req, res) => {

    var server = { req:req, res:res };

    var id = req.body.id;

    var inventory = req.body.inventory;
    inventory = parseInt(inventory);

    var inventory_status = req.body.inventory_status;

    if(typeof(id)=='undefined'){
        error.param_required(server,'id parameter required','id'); return;
    }

    if((id).trim()==''){
        error.required(server,'id is required'); return;
    }

    if(typeof(inventory)=='undefined'){
        error.param_required(server,'inventory parameter required','inventory'); return;
    }

    if(!Number(inventory)){
        error.required(server,'inventory field must be number'); return;
    }

    if(typeof(inventory_status)=='undefined'){
        error.required(server, 'inventory status parameter required', 'inventory_status'); return;
    }

    if((inventory_status).trim()==''){
        error.required(server, 'inventory status is required'); return;
    }


    try {

        var upt_inventory_data = { $set: { quantity: inventory, status: inventory_status}};

        const uptProdInventory = await productInventory.updateOne({_id: mongoose.Types.ObjectId(id)}, upt_inventory_data);

        var api_response = {
            result: uptProdInventory
        };

        var msg = "Product inventory updated successfully";

        status.success(server, api_response, msg); return;
        
    } catch (err) {
        res.status(400).send(err); return;
    }

});

//inventory delete
router.delete('/inventory/delete', async (req, res) => {

    var server = { req:req, res:res };

    var id = req.body.id;

    if(typeof(id)=='undefined'){
        error.param_required(server,'id parameter required','id'); return;
    }

    if((id).trim()==''){
        error.required(server,'id is required'); return;
    }

    try {

        const deleteProdInventory = await productInventory.deleteOne({_id: mongoose.Types.ObjectId(id)});

        var api_response = {
            result: deleteProdInventory
        };

        var msg = "Product inventory deleted successfully";

        status.success(server, api_response, msg); return;
        
    } catch (err) {
        res.status(400).send(err); return;
    }

});

//discount create
router.post('/discount/create', async (req, res) => {
    var server = { req: req, res: res };

    var name = req.body.name;
    var description = req.body.description;
    var discount = req.body.discount;


    if(typeof(name)=='undefined'){
        error.param_required(server,'name parameter required','name'); return;
    }

    if((name).trim()==''){
        error.required(server,'name is required'); return;
    }

    if(typeof(description)=='undefined'){
        error.param_required(server,'description parameter required','description'); return;
    }

    if((description).trim()==''){
        error.required(server,'description is required'); return;
    }

    if(typeof(discount)=='undefined'){
        error.param_required(server,'discount parameter required','discount'); return;
    }

    if(!Number(discount)){
        error.required(server,'discount field must be number'); return;
    }

    //Check if the discount name is already in the database
    const discountExist = await productDiscount.findOne({name:name});
    if(discountExist) return status.conflict(server);

    const prodDiscount = new productDiscount({
        _id: new mongoose.Types.ObjectId(),
        name: name,
        description: description,
        discount_percentage: discount,
        status: 'active'
    });

    try {
        const savedprodDiscount =  await prodDiscount.save();
    
        var api_response = {
            _id: savedprodDiscount._id,
            result: savedprodDiscount
        };

        var msg = "Product discount added successfull";

        status.success(server,api_response,msg); return;
    
    } catch (err) {
        res.status(400).send(err); return;
    }


});

//discount update
router.put('/discount/update', async (req, res) => {
    var server = { req: req, res: res };

    var id = req.body.id;
    var name = req.body.name;
    var description = req.body.description;
    var discount = req.body.discount;
    var discount_status = req.body.discount_status;

    if(typeof(id)=='undefined'){
        error.param_required(server,'id parameter required','id'); return;
    }

    if((id).trim()==''){
        error.required(server,'id is required'); return;
    }

    if(typeof(name)=='undefined'){
        error.param_required(server,'name parameter required','name'); return;
    }

    if((name).trim()==''){
        error.required(server,'name is required'); return;
    }

    if(typeof(description)=='undefined'){
        error.param_required(server,'description parameter required','description'); return;
    }

    if((description).trim()==''){
        error.required(server,'description is required'); return;
    }

    if(typeof(discount)=='undefined'){
        error.param_required(server,'discount parameter required','discount'); return;
    }

    if(!Number(discount)){
        error.required(server,'discount field must be number'); return;
    }

    if(typeof(discount_status)=='undefined'){
        error.param_required(server,'discount status parameter required','discount_status'); return;
    }

    if((discount_status).trim()==''){
        error.required(server,'discount status is required'); return;
    }

    try {

        var upt_prod_discnt = { $set: { name: name, description: description, discount_percentage: discount, status: discount_status} };

        const uptprodDiscount =  await productDiscount.updateOne({_id: mongoose.Types.ObjectId(id)}, upt_prod_discnt);
    
        var api_response = {
            result: uptprodDiscount
        };

        var msg = "Product discount updated successfull";

        status.success(server,api_response,msg); return;
    
    } catch (err) {
        res.status(400).send(err); return;
    }


});

//discount delete
router.delete('/discount/delete', async (req, res) => {
    var server = { req: req, res: res };

    var id = req.body.id;

    if(typeof(id)=='undefined'){
        error.param_required(server,'id parameter required','id'); return;
    }

    if((id).trim()==''){
        error.required(server,'id is required'); return;
    }

    try {

        const deleteprodDiscount =  await productDiscount.deleteOne({_id: mongoose.Types.ObjectId(id)});
    
        var api_response = {
            result: deleteprodDiscount
        };

        var msg = "Product discount deleted successfull";

        status.success(server,api_response,msg); return;
    
    } catch (err) {
        res.status(400).send(err); return;
    }


});

//product create
router.post('/create', async (req, res) => {
    var server = { req: req, res: res };

    var name = req.body.name;
    var description = req.body.description;
    var category_id = req.body.category_id;
    var sub_category_id = req.body.sub_category_id;
    var inventory_id = req.body.inventory_id;
    var discount_id = req.body.discount_id;
    var brand = req.body.brand;
    var price = req.body.price;

    var storage = '';
    var ram = '';
    var color = '';
    var model_no = '';

    if(typeof(name)=='undefined'){
        error.param_required(server,'name parameter required','name'); return;
    }

    if((name).trim()==''){
        error.required(server,'name is required'); return;
    }

    if(typeof(description)=='undefined'){
        error.param_required(server,'description parameter required','description'); return;
    }

    if((description).trim()==''){
        error.required(server,'description is required'); return;
    }

    if(typeof(category_id)=='undefined'){
        error.param_required(server,'category id parameter required','category_id'); return;
    }

    if((category_id).trim()==''){
        error.required(server,'category id is required'); return;
    }

    if(typeof(sub_category_id)=='undefined'){
        error.param_required(server,'sub category id parameter required','sub_category_id'); return;
    }

    if((sub_category_id).trim()==''){
        error.required(server,'sub category id is required'); return;
    }

    if(typeof(inventory_id)=='undefined'){
        error.param_required(server,'inventory id parameter required','inventory_id'); return;
    }

    if((inventory_id).trim()==''){
        error.required(server,'inventory id is required'); return;
    }

    if(typeof(discount_id)=='undefined'){
        error.param_required(server,'discount id parameter required','discount_id'); return;
    }

    if((discount_id).trim()==''){
        error.required(server,'discount id is required'); return;
    }

    if(typeof(brand)=='undefined'){
        error.param_required(server,'brand parameter required','brand'); return;
    }

    if((brand).trim()==''){
        error.required(server,'brand is required'); return;
    }

    if(typeof(price)=='undefined'){
        error.param_required(server,'price parameter required','price'); return;
    }

    if(!Number(price)){
        error.required(server,'price field must be number'); return;
    }

    //Check if the product name is already in the database
    const productExist = await product.findOne({name:name});
    if(productExist) return status.conflict(server);

    if(description != null && description != ''){
        description = description.split(',');
    }else{
        description = [];
    }

    var sku = randomstring.generate(8);


    //prod category and sub category checking for storage, ram , colors updating to db

    //category and sub category filter
    var category_name = '', sub_category_name = '';
    
    const category_data = await productCategory.findOne({_id: mongoose.Types.ObjectId(category_id)},{name:1});
    if(category_data != null){
        console.log(category_data);
        category_name = category_data.name;
    }
    
    const sub_category_data = await productSubCategory.findOne({_id: mongoose.Types.ObjectId(sub_category_id)}, { name: 1 })
    
    if(sub_category_data != null){
        sub_category_name = sub_category_data.name;
    }
    

    switch(category_name){
        case "Mobiles":
            if(sub_category_name == 'All Mobiles'){

                storage = req.body.storage;
                ram = req.body.ram;
                color = req.body.color;
                model_no = req.body.model_no;

                if(typeof(storage)=='undefined'){
                    error.param_required(server,'storage parameter required','storage'); return;
                }
                if((storage).trim()==''){
                    error.required(server,'storage is required'); return;
                }

                if(typeof(ram)=='undefined'){
                    error.param_required(server,'ram parameter required','ram'); return;
                }
                if((ram).trim()==''){
                    error.required(server,'ram is required'); return;
                }

                if(typeof(color)=='undefined'){
                    error.param_required(server,'color parameter required','color'); return;
                }
                if((color).trim()==''){
                    error.required(server,'color is required'); return;
                }

                if(typeof(model_no)=='undefined'){
                    error.param_required(server,'model_no parameter required','model_no'); return;
                }
                if((model_no).trim()==''){
                    error.required(server,'model_no is required'); return;
                }
            }
        break;
        case "Electronics":
            if(sub_category_name == "Smart Watches"){
               
            }else if(sub_category_name == "Headphones"){
                
            }
        break;

    }


    const prod = new product({
        _id: new mongoose.Types.ObjectId(),
        name: name,
        description: description,
        sku: sku,
        category_id: category_id,
        sub_category_id: sub_category_id,
        inventory_id: inventory_id,
        discount_id: discount_id,
        brand: brand,
        price: price,
        storage: storage,
        ram: ram,
        color: color,
        model_no: model_no,
        status: 'active'
    });

    try {
        const savedProd =  await prod.save();
    
        var api_response = {
            _id: savedProd._id,
            result: savedProd
        };

        var msg = "Product added successfull";

        status.success(server,api_response,msg); return;
    
    } catch (err) {
        res.status(400).send(err); return;
    }


});

// product lists
router.post("/list", async (req, res) => {
    var server = { req:req, res: res };
    //console.log(req.query);
    //console.log(req.body);

    //console.log(config.mobile_brands);
    //return false;

    //pagination
    var limit = Number(req.query.limit);

    var pageno = Number(req.query.pageno);

    var start = limit * (pageno - 1);

    //Filters

    //search product filter
    var search = req.body.search;

    //price range filter
    var prices, p1_gt = 0, p2_lt = 0;
    var price_range = req.body.price_range;
    //console.log("price_range : ", price_range.length);
    if(price_range.length > 0 && price_range != 'undefined'){ 
        prices = price_range.split('-');
        p1_gt = Number(prices[0]);
        p2_lt = Number(prices[1]);
        console.log(p1_gt);
        console.log(p2_lt);
    }else{
        p1_gt = 0;
        p2_lt = 500000;
        console.log(p1_gt);
        console.log(p2_lt);
    }
    
    //brand names filter
    var brand_name = req.body.brand_name;
    console.log(brand_name);

    //category and sub category filter
    var category_name = '', sub_category_name = '';
    var category_id = req.body.category_id;
    console.log("category_id : ", category_id);
    const category_data = await productCategory.findOne({_id: mongoose.Types.ObjectId(category_id)},{name:1});
    if(category_data != null){
        console.log(category_data);
        category_name = category_data.name;
    }
    
    var sub_category_id = req.body.sub_category_id;
    const sub_category_data = await productSubCategory.findOne({_id: mongoose.Types.ObjectId(sub_category_id)}, { name: 1 })
    console.log("sub_category_id : ", sub_category_id);
    if(sub_category_data != null){
        sub_category_name = sub_category_data.name;
    }
    //res.send(sub_category_name);return false;

    switch(category_name){
        case "Mobiles":
            if(sub_category_name == 'All Mobiles'){
                if(brand_name.length == 0 && Array.isArray(brand_name)){
                    brand_name = config.mobile_brands;
                }
                console.log("brand_name : ", brand_name);
            }
        break;
        case "Electronics":
            if(sub_category_name == "Smart Watches"){
                if(brand_name.length == 0 && Array.isArray(brand_name)){
                    brand_name = config.smart_watch_brands;
                }
                console.log("brand_name : ", brand_name);
            }else if(sub_category_name == "Headphones"){
                if(brand_name.length == 0 && Array.isArray(brand_name)){
                    brand_name = config.headphones_brands;
                }
                console.log("brand_name : ", brand_name);
            }
        break;

    }


    //discount filter
    var discount_percentage = req.body.discount_percentage;
    if(discount_percentage.length == 0 && Array.isArray(discount_percentage)){
        discount_percentage = config.all_discount_percentages;
    }
    console.log("discount_percentage : ", discount_percentage);

    //sort - asc / desc
    var sort = req.query.sort;

    if(sort == 'asc'){
        sort = { _id: 1 };
    }else if(sort == 'desc'){
        sort = { _id: -1 };
    }else{
        sort = { _id: -1 };
    }

   
    const result = await product.aggregate([
        {
            $match: 
            {
                $and : [
                    { $or : [ { name: new RegExp(search, 'i')} ] },
                    { $or : [ { brand: { $in: brand_name } } ] },
                    { $or : [ { price : { $gte: p1_gt} } ] },
                    { $or : [ { price : { $lte : p2_lt } }]},
                ]
            }
        },
        //categories 
        {   $lookup:
            {
              from: 'product_categories',
              localField: 'category_id',
              foreignField: '_id',
              as: 'category'
            }
        },
        //sub categories 
        {   $lookup:
            {
              from: 'product_sub_categories',
              localField: 'sub_category_id',
              foreignField: '_id',
              as: 'sub_category'
            }
        },
        //inventories
        {   $lookup:
            {
              from: 'product_inventories',
              localField: 'inventory_id',
              foreignField: '_id',
              as: 'inventory'
            }
        },
        //discounts
        {   $lookup:
            {
              from: 'product_discounts',
              localField: 'discount_id',
              foreignField: '_id',
              as: 'discount'
            }
        },

        {
            $match: 
            {
                "category": { $elemMatch: { $and : [
                    { $or : [ { _id: mongoose.Types.ObjectId(category_id) } ] }
                ]}},

                "sub_category": { $elemMatch: { $and : [
                    { $or : [ { _id: mongoose.Types.ObjectId(sub_category_id) } ] }
                ]}},

                "discount": { $elemMatch: { $and : [
                    { $or : [ { discount_percentage:  { $in: discount_percentage } } ] }
                ]}}
            }
        },

        {
            $project: { _id:1, name:1, description:1, price:1, brand:1, product_image_name:1, color:1, ram:1, storage:1, model_no: 1, category: { $arrayElemAt: [ "$category", 0 ]}, sub_category: { $arrayElemAt: [ "$sub_category", 0 ]}, inventory: { $arrayElemAt: [ "$inventory", 0 ]}, discount: { $arrayElemAt: [ "$discount", 0 ]}}
        },
        
       
        { $sort : sort } ,
        { $skip : start },
        { $limit: limit },

    ]);

    console.log(result);
    //res.send(result); return;

    if(result.length > 0){
        var api_response = {
            total_records: result.length,
            result: result
        };
        var msg = "Products list found";

        status.success(server,api_response,msg); return;
    }else{
        status.no_record(server); return;
    }
       
});

//product image upload
router.post('/image-upload', upload.single('product_image'), async (req, res) => {
    var server = { req:req, res:res };

    var filename = req.file.filename;
    //var originalname = req.file.originalname;
    var file_path = req.file.destination+''+filename;

    var product_id = req.body.product_id;

    try {

        //delete existing product image from uploaded path

        const prodInfo = await product.findOne({_id: mongoose.Types.ObjectId(product_id)}, { name:1, product_image_path:1, product_image_name:1})
        
        if(prodInfo.product_image_name != null && prodInfo.product_image_name != ""){
            fs.unlink(prodInfo.product_image_path, function(err){
                if(err){
                    error.existing_file_delete_error(server); return;
                }
            })
        }
        // console.log(prodInfo);

        // res.send(prodInfo); return;

        //update product image

        var upt_data = { $set: {product_image_path: file_path, product_image_name: filename} };

        const prodImageUpt = await product.updateOne({_id: mongoose.Types.ObjectId(product_id)}, upt_data);

        var msg = "Product image update successfully";

        var api_response = {
            result: prodImageUpt
        }
        status.success(server,api_response,msg); return;
        
    } catch (err) {
        res.status(400).send(err); return;
    }
    
});

//product edit
router.post('/update', async (req, res) => {
    var server = { req: req, res: res };

    var product_id = req.body.product_id;
    var name = req.body.name;
    var description = req.body.description;
    var category_id = req.body.category_id;
    var sub_category_id = req.body.sub_category_id;
    var inventory_id = req.body.inventory_id;
    var discount_id = req.body.discount_id;
    var brand = req.body.brand;
    var price = req.body.price;
    var prod_status = req.body.status;


    if(typeof(product_id)=='undefined'){
        error.param_required(server,'product id parameter required','product_id'); return;
    }

    if((product_id).trim()==''){
        error.required(server,'product id is required'); return;
    }

    if(typeof(name)=='undefined'){
        error.param_required(server,'name parameter required','name'); return;
    }

    if((name).trim()==''){
        error.required(server,'name is required'); return;
    }

    if(typeof(description)=='undefined'){
        error.param_required(server,'description parameter required','description'); return;
    }

    if((description).trim()==''){
        error.required(server,'description is required'); return;
    }

    if(typeof(category_id)=='undefined'){
        error.param_required(server,'category id parameter required','category_id'); return;
    }

    if((category_id).trim()==''){
        error.required(server,'category id is required'); return;
    }

    if(typeof(sub_category_id)=='undefined'){
        error.param_required(server,'sub category id parameter required','sub_category_id'); return;
    }

    if((sub_category_id).trim()==''){
        error.required(server,'sub category id is required'); return;
    }

    if(typeof(inventory_id)=='undefined'){
        error.param_required(server,'inventory id parameter required','inventory_id'); return;
    }

    if((inventory_id).trim()==''){
        error.required(server,'inventory id is required'); return;
    }

    if(typeof(discount_id)=='undefined'){
        error.param_required(server,'discount id parameter required','discount_id'); return;
    }

    if((discount_id).trim()==''){
        error.required(server,'discount id is required'); return;
    }

    if(typeof(brand)=='undefined'){
        error.param_required(server,'brand parameter required','brand'); return;
    }

    if((brand).trim()==''){
        error.required(server,'brand is required'); return;
    }

    if(typeof(price)=='undefined'){
        error.param_required(server,'price parameter required','price'); return;
    }

    if(!Number(price)){
        error.required(server,'price field must be number'); return;
    }

    if(typeof(prod_status)=='undefined'){
        error.param_required(server,'status parameter required','status'); return;
    }

    if((prod_status).trim()==''){
        error.required(server,'status is required'); return;
    }

    if(description != null && description != ''){
        description = description.split(',');
    }else{
        description = [];
    }
    

    try {
        var update_data = { $set: { name: name, description: description, category_id: category_id, sub_category_id: sub_category_id, inventory_id: inventory_id, discount_id: discount_id, brand: brand, price: price, status: prod_status } };

        const updateProdInfo =  await product.updateOne({_id: mongoose.Types.ObjectId(product_id)}, update_data);
    
        var api_response = {
            result: updateProdInfo
        };

        var msg = "Product updated successfull";

        console.log(api_response);

        status.success(server,api_response,msg); return;
    
    } catch (err) {
        res.status(400).send(err); return;
    }


});


// product info 2
router.get("/info2", async (req, res) => {
    var server = { req:req, res: res };
    //console.log(req.query);

   
    var product_id = req.query.product_id;

    if(typeof(product_id)=='undefined'){
        error.param_required(server,'product id parameter required','product_id'); return;
    }

    if((product_id).trim()==''){
        error.required(server,'product id is required'); return;
    }

    const result = await product.aggregate([
        {
            $match: 
            {
               _id: mongoose.Types.ObjectId(product_id)
            }
        },
        //categories 
        {   $lookup:
            {
              from: 'product_categories',
              localField: 'category_id',
              foreignField: '_id',
              as: 'category'
            }
        },
        //sub categories 
        {   $lookup:
            {
              from: 'product_sub_categories',
              localField: 'sub_category_id',
              foreignField: '_id',
              as: 'sub_category'
            }
        },
        //inventories
        {   $lookup:
            {
              from: 'product_inventories',
              localField: 'inventory_id',
              foreignField: '_id',
              as: 'inventory'
            }
        },
        //discounts
        {   $lookup:
            {
              from: 'product_discounts',
              localField: 'discount_id',
              foreignField: '_id',
              as: 'discount'
            }
        },


        {
            $project: { _id:1, name:1, description:1, price:1, brand:1, product_image_name:1, category: { $arrayElemAt: [ "$category", 0 ]}, sub_category: { $arrayElemAt: [ "$sub_category", 0 ]}, inventory: { $arrayElemAt: [ "$inventory", 0 ]}, discount: { $arrayElemAt: [ "$discount", 0 ]}}
        },

    ]);

    //console.log(result);
    res.send(result); return;

    if(result.length > 0){
        var api_response = {
            result: result
        };
        var msg = "Product info found";

        status.success(server,api_response,msg); return;
    }else{
        status.no_record(server); return;
    }
       
});

// product info
router.get("/info", async (req, res) => {
    var server = { req:req, res: res };
    //console.log(req.query);

   
    var product_id = req.query.product_id;

    if(typeof(product_id)=='undefined'){
        error.param_required(server,'product id parameter required','product_id'); return;
    }

    if((product_id).trim()==''){
        error.required(server,'product id is required'); return;
    }

    const result = await product.aggregate([
        {
            $match: 
            {
               _id: mongoose.Types.ObjectId(product_id)
            }
        },
        //categories 
        {   $lookup:
            {
              from: 'product_categories',
              localField: 'category_id',
              foreignField: '_id',
              as: 'category'
            }
        },
        //sub categories 
        {   $lookup:
            {
              from: 'product_sub_categories',
              localField: 'sub_category_id',
              foreignField: '_id',
              as: 'sub_category'
            }
        },
        //inventories
        {   $lookup:
            {
              from: 'product_inventories',
              localField: 'inventory_id',
              foreignField: '_id',
              as: 'inventory'
            }
        },
        //discounts
        {   $lookup:
            {
              from: 'product_discounts',
              localField: 'discount_id',
              foreignField: '_id',
              as: 'discount'
            }
        },


        {
            $project: { _id:1, name:1, description:1, price:1, brand:1, product_image_name:1, category: { $arrayElemAt: [ "$category", 0 ]}, sub_category: { $arrayElemAt: [ "$sub_category", 0 ]}, inventory: { $arrayElemAt: [ "$inventory", 0 ]}, discount: { $arrayElemAt: [ "$discount", 0 ]}}
        },

    ]);

    //console.log(result);
    //res.send(result); return;

    if(result.length > 0){
        var api_response = {
            result: result
        };
        var msg = "Product info found";

        status.success(server,api_response,msg); return;
    }else{
        status.no_record(server); return;
    }
       
});

//product delete
router.delete('/delete', async (req, res) => {

    var server = {req:req, res:res};

    var product_id = req.body.product_id;

    if(typeof(product_id)=='undefined'){
        error.param_required(server,'product id parameter required','product_id'); return;
    }

    if((product_id).trim()==''){
        error.required(server,'product id is required'); return;
    }

    try {

        const deleteprod =  await product.deleteOne({_id: mongoose.Types.ObjectId(product_id)});
    
        var api_response = {
            result: deleteprod
        };

        var msg = "Product deleted successfull";

        status.success(server,api_response,msg); return;
    
    } catch (err) {
        res.status(400).send(err); return;
    }

});

router.post("/tracking", async (req, res) => {

    var server = {req:req, res:res };

   // console.log(req.body); return;

    var user_id = req.body.user_id;

    var product_tracking_id = req.body.product_tracking_id;

    var track_option = req.body.track_option;

    var flag_value = req.body.flag_value;

    var update_data = {};

    var msg_notify = '';

    switch(track_option){
        case "ordered":
            update_data.ordered_status = flag_value;
        break;
        case "shipped":
            update_data.shipped_status = flag_value;
            msg_notify = "Your order has been shipped";
        break;
        case "out_for_delivery":
            update_data.out_for_delivery_status = flag_value;
            msg_notify = "Your order has been out for delivery";
        break;
        case "delivered":
            update_data.delivered_status = flag_value;
            msg_notify = "Your order has been delivered";
        break;
        case "cancelled":
            update_data.status = "cancelled";
            msg_notify = "Your order has been cancelled";
        break;
    }

    //console.log(update_data); return;

    const uptProdTrack = await productTracking.updateOne({_id: mongoose.Types.ObjectId(product_tracking_id)}, { $set: update_data })

    const result = await productTracking.aggregate([

        {
            $match:
            {
                _id: mongoose.Types.ObjectId(product_tracking_id)
            }
        },

        {
            $lookup:{
                from: 'products',
                localField: 'product_id',
                foreignField: '_id',
                as: 'products'
            }
        },
        {
            $project:
            {
                _id: 1,
                ordered_status: 1,
                shipped_status: 1,
                out_for_delivery_status: 1,
                delivered_status: 1,
                products: { $arrayElemAt: ["$products", 0]},
            }
        }
    ]);

    if(result.length > 0){

        result.forEach(pt_res => {

            var data = { 
                user_id: user_id,
                title: "EKART-APP"+" | "+msg_notify,
                body: pt_res.products.name, 
                icon : config.product_path+""+pt_res.products.product_image_name 
            };

            functions.product_status_notification(server, data, async function(err, response_body){
                var api_response = {
                    result: uptProdTrack,
                    push_notification: response_body
                };
                status.success(server,api_response, msg_notify); return;
            });
            
        });
    }


});

//Product Colors
router.get("/colors", async (req, res) => {

    var server = {req:req, res:res };

    var category_id = req.query.category_id;

    var storage = req.query.storage;

    var ram = req.query.ram;

    var model_no = req.query.model_no;

    try {
        const prodcolors = await product.find({category_id:category_id, storage:storage, ram:ram, model_no:model_no}, {_id:1, category_id:1, color: 1, storage:1, ram:1, model_no: 1});
        
        if(prodcolors.length > 0){
            var api_response = {
                total_records: prodcolors.length,
                result: prodcolors
            };
            var msg = "Products colors found";
    
            status.success(server,api_response,msg); return;
        }else{
            status.no_record(server); return;
        }

    } catch (err) {
        res.send(err);
    }

});

//FETCH PRODUCT STORAGE - BASED ON COLORS
router.get("/storage", async (req, res) => {

    var server = {req:req, res:res };
    
    var model_no = req.query.model_no;

    var category_id = req.query.category_id;

    var color = req.query.color;

    //var ram = req.query.ram;

    try {

        

        const prodstorage = await product.find({
            category_id:mongoose.Types.ObjectId(category_id),
            model_no:model_no, 
            $or:[ {color:color} ] 
        },{_id:1, category_id:1, storage: 1, ram: 1, color: 1, model_no: 1});
        
        if(prodstorage.length > 0){
            var api_response = {
                total_records: prodstorage.length,
                result: prodstorage
            };
            var msg = "Products storage found";
    
            status.success(server,api_response,msg); return;
        }else{
            status.no_record(server); return;
        }

    } catch (err) {
        res.send(err);
    }

});


//FETCH PRODUCT RAMS - BASED ON COLORS
router.get("/ram", async (req, res) => {

    var server = {req:req, res:res };
    
    var model_no = req.query.model_no;

    var category_id = req.query.category_id;

    var color = req.query.color;

    var storage = req.query.storage;

    try {

        

        const prodsram = await product.find({
            category_id:mongoose.Types.ObjectId(category_id),
            model_no:model_no, 
            color:color
           // $and:[ {color:color},{storage:storage} ] 
        },{_id:1, category_id:1, storage: 1, ram: 1, color: 1, model_no: 1});
        
        if(prodsram.length > 0){
            var api_response = {
                total_records: prodsram.length,
                result: prodsram
            };
            var msg = "Products ram found";
    
            status.success(server,api_response,msg); return;
        }else{
            status.no_record(server); return;
        }

    } catch (err) {
        res.send(err);
    }

});


//Product Storage
router.get("/storage", async (req, res) => {

    var server = {req:req, res:res };

    var category_id = req.query.category_id;

    var model_no = req.query.model_no;

    console.log("ddd");

    try {
        const prodStorage = await product.aggregate([
            
            {
                $match: 
                {
                   category_id: mongoose.Types.ObjectId(category_id),
                   model_no: model_no
                }
            },

            {$group: {"_id": {storage: "$storage", ram: "$ram", color: "$color", id:"$_id"}}}
              
            
        ]);

        console.log(prodStorage);
        
        if(prodStorage.length > 0){
            var api_response = {
                total_records: prodStorage.length,
                result: prodStorage
            };
            var msg = "Products storage found";
    
            status.success(server,api_response,msg); return;
        }else{
            status.no_record(server); return;
        }

    } catch (err) {
        res.send(err);
    }

});


module.exports = router;
