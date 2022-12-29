const router = require('express').Router();
const mongoose = require('mongoose');
const { Cart } = require('../models/Cart');
var getstatus = require('../common/status');
var status = getstatus.status;
var error = getstatus.error;

//Add item to cart 
router.post('/create', async (req, res) => {

    var server = { req: req, res: res };

    var user_id = req.body.user_id;
    var product_id = req.body.product_id;
    var quantity = req.body.quantity;

    quantity = parseInt(quantity);

    if(typeof(user_id)=='undefined'){
        error.param_required(server,'user id parameter required','user_id'); return;
    }

    if((user_id).trim()==''){
        error.required(server,'user id is required'); return;
    }

    if(typeof(product_id)=='undefined'){
        error.param_required(server,'product id parameter required','product_id'); return;
    }

    if((product_id).trim()==''){
        error.required(server,'product id is required'); return;
    }

    if(typeof(quantity)=='undefined'){
        error.param_required(server,'quantity parameter required','quantity'); return;
    }

    if(!Number(quantity)){
        error.required(server,'quantity field must be number'); return;
    }

    const cart = new Cart({
        _id: new mongoose.Types.ObjectId(),
        user_id: user_id,
        product_id: product_id,
        quantity: quantity
    });

    try {
        const savedcart =  await cart.save();
    
        var api_response = {
            _id: savedcart._id,
            result: savedcart
        };

        var msg = "Product added to cart successfull";

        status.success(server,api_response,msg); return;
    
    } catch (err) {
        res.status(400).send(err); return;
    }


});

//delete an item from cart
router.delete("/delete", async (req, res) => {

    var server = {req:req, res:res};

    var user_id = req.body.user_id;

    var cart_id = req.body.cart_id;

    if(typeof(user_id)=='undefined'){
        error.param_required(server,'user id parameter required','user_id'); return;
    }

    if((user_id).trim()==''){
        error.required(server,'user id is required'); return;
    }

    if(typeof(cart_id)=='undefined'){
        error.param_required(server,'cart id parameter required','cart_id'); return;
    }

    if((cart_id).trim()==''){
        error.required(server,'cart id is required'); return;
    }

    try {
        const deleteCartItem = await Cart.deleteOne({_id: mongoose.Types.ObjectId(cart_id), user_id: mongoose.Types.ObjectId(user_id)})

        var api_response = {
            result: deleteCartItem
        };

        var msg = "Cart item deleted successfull";

        status.success(server,api_response,msg); return;
    } catch (err) {
        res.status(400).send(err); return;
    }


});

module.exports = router;
