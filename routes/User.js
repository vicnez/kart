const router = require('express').Router();
const { User, UserAddress, UserNotificationToken } = require('../models/User');
const mongoose = require('mongoose');
var getstatus = require('../common/status');
var status = getstatus.status;
var error = getstatus.error;

const bcrypt = require('bcryptjs');
var emailValidator = require('email-validator');
var passwordValidator = require('password-validator');

const validatePhoneNumber = require('validate-phone-number-node-js');

const jwt = require('jsonwebtoken');
const donenv = require('dotenv');
donenv.config();

const nodemailer = require('nodemailer');

const otpGenerator = require('otp-generator');

const config = require('../common/config');

const multer = require('multer');

const path = require('path');

const fs = require('fs');
const req = require('express/lib/request');

const storage = multer.diskStorage({
   destination: config.user_img_upload_path,
   filename: (req, file, callback) => {
       return callback(null, `${file.originalname.split('.').slice(0, -1).join('.')}_${Date.now()}${path.extname(file.originalname)}`);
   }
});

const upload = multer({
    storage:storage
});

//Signup
router.post('/signup', async (req, res) => {

    var server = { req: req, res: res };

    var first_name = req.body.first_name;
    var last_name = req.body.last_name;
    var email_address = req.body.email_address;
    var phone_number =  req.body.phone_number;
    var password = req.body.password;

    if(typeof(first_name)=='undefined'){
        error.param_required(server,'first name parameter required','first_name'); return;
    }

    if((first_name).trim()==''){
        error.required(server,'first name is required'); return;
    }

    if(typeof(last_name)=='undefined'){
        error.param_required(server,'last name parameter required','last_name'); return;
    }

    if((last_name).trim()==''){
        error.required(server,'last name is required'); return;
    }



    var pass_valid = new passwordValidator();
    pass_valid.is().min(4).is().max(25);

    if(typeof(email_address)=='undefined'){
        error.param_required(server,'email address parameter required','email_address'); return;
    }

    if((email_address).trim()==''){
        error.required(server,'email address is required'); return;
    }

    if(emailValidator.validate(email_address) != true){
        error.invalid_email(server, email_address); return
    }


    if(typeof(phone_number)=='undefined'){
        error.param_required(server,'phone number parameter required','phone_number'); return;
    }

    if((phone_number).trim()==''){
        error.required(server,'phonenumber is required'); return;
    }

    var countrycode_phone = "+91"+phone_number;
    const phone_status = validatePhoneNumber.validate(countrycode_phone);

    if(phone_status != true){
        error.invalid_phone(server, phone_number); return
    }
    

    if(typeof(password)=='undefined'){
        error.param_required(server,'password parameter required','password'); return;
    }

    if((password).trim()==''){
        error.required(server,'password is required'); return;
    }
    if(pass_valid.validate(password) != true ){
        error.invalid_password(server); return
    }

    email_address = email_address.toLowerCase();


    //Check if the user is already in the database
    const emailExist = await User.findOne({email_address:email_address});
    if(emailExist) return error.conflict_email(server);

    //Hash password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(req.body.password, salt);


    const user = new User({
        first_name: first_name,
        last_name: last_name,
        email_address: email_address,
        phone_number: phone_number,
        status: 'active',
        password: hashPassword
    });

    try {
        const savedUser =  await user.save();
    
        var api_response = {
            user_id: user._id,
            result: savedUser
        };

        var msg = "User signup successfull";

        status.success(server,api_response,msg); return;
    
    } catch (err) {
        res.status(400).send(err); return;
    }

});

//User update
router.put('/update', async (req, res) => {

    var server = { req: req, res: res };

    var id = req.body.id;
    var first_name = req.body.first_name;
    var last_name = req.body.last_name;
    var user_status = req.body.user_status;

    if(typeof(id)=='undefined'){
        error.param_required(server,'id parameter required','id'); return;
    }

    if((id).trim()==''){
        error.required(server,'id is required'); return;
    }

    if(typeof(first_name)=='undefined'){
        error.param_required(server,'first name parameter required','first_name'); return;
    }

    if((first_name).trim()==''){
        error.required(server,'first name is required'); return;
    }

    if(typeof(last_name)=='undefined'){
        error.param_required(server,'last name parameter required','last_name'); return;
    }

    if((last_name).trim()==''){
        error.required(server,'last name is required'); return;
    }

    if(typeof(user_status)=='undefined'){
        error.param_required(server,'user status parameter required','user_status'); return;
    }

    if((user_status).trim()==''){
        error.required(server,'user status is required'); return;
    }


    try {

        var upt_user_data = { $set : { first_name: first_name, last_name: last_name, status: user_status }};
        const uptUser =  await User.updateOne({_id:mongoose.Types.ObjectId(id)}, upt_user_data);
    
        var api_response = {
            result: uptUser
        };

        var msg = "User info updated successfully";

        status.success(server,api_response,msg); return;
    
    } catch (err) {
        res.status(400).send(err); return;
    }

});

//Login
router.post('/login', async (req, res) => {

    var server = { req: req, res: res };

    var username = req.body.username;
    var password = req.body.password;


    if(typeof(username)=='undefined'){
        error.param_required(server,'username parameter required','username'); return;
    }

    if((username).trim()==''){
        error.required(server,'username is required'); return;
    }


    if(typeof(password)=='undefined'){
        error.param_required(server,'password parameter required','password'); return;
    }

    if((password).trim()==''){
        error.required(server,'password is required'); return;
    }


    //Check if the user is already in the database
    const user = await User.findOne({$or:[{email_address: username},{phone_number: username}]});
    if(!user) return status.no_record(server);


    //Checks password
    const validPassword = await bcrypt.compare(password.toString(), user.password);
    if(!validPassword) return error.wrong_password(server);

    //jwt token create & assign
    const token = jwt.sign({id: user._id}, process.env.TOKEN_SECRET);


    var result = {token: token, user_id: user._id, first_name: user.first_name, last_name: user.last_name, profile_pic: user.profile_pic, status: user.status};
    var api_response = {
        status:"success",
        status_code:200,
        message:"Logged in successfully",
        result:result
    };

    var msg = "Logged in successfully";

    status.success(server,api_response,msg); return;
});

//user address create
router.post('/address/create', async (req, res) => {

    console.log(req.body);

    var server = { req: req, res: res };

    var name = req.body.name;
    var user_id = req.body.user_id;
    var address_line1 = req.body.address_line1;
    var address_line2 =  req.body.address_line2;
    var city = req.body.city;
    var postal_code = req.body.postal_code;
    var country = req.body.country;
    var phone_number =  req.body.phone_number;

    if(typeof(name)=='undefined'){
        error.param_required(server,'name parameter required','name'); return;
    }

    if((name).trim()==''){
        error.required(server,'name is required'); return;
    }

    if(typeof(user_id)=='undefined'){
        error.param_required(server,'user id parameter required','user_id'); return;
    }

    if((user_id).trim()==''){
        error.required(server,'user id is required'); return;
    }

    if(typeof(address_line1)=='undefined'){
        error.param_required(server,'address line1 parameter required','address_line1'); return;
    }

    if((address_line1).trim()==''){
        error.required(server,'address line1  is required'); return;
    }

    if(typeof(address_line2)=='undefined'){
        error.param_required(server,'address line2 parameter required','address_line2'); return;
    }

    if((address_line2).trim()==''){
        error.required(server,'address line2  is required'); return;
    }

    if(typeof(city)=='undefined'){
        error.param_required(server,'city parameter required','city'); return;
    }

    if((city).trim()==''){
        error.required(server,'city  is required'); return;
    }

    if(typeof(postal_code)=='undefined'){
        error.param_required(server,'postal code parameter required','postal_code'); return;
    }

    if((postal_code).trim()==''){
        error.required(server,'postal code is required'); return;
    }

    if(typeof(country)=='undefined'){
        error.param_required(server,'country parameter required','country'); return;
    }

    if((country).trim()==''){
        error.required(server,'country is required'); return;
    }


    if(typeof(phone_number)=='undefined'){
        error.param_required(server,'phone number parameter required','phone_number'); return;
    }

    if((phone_number).trim()==''){
        error.required(server,'phone number is required'); return;
    }

    var countrycode_phone = "+91"+phone_number;
    const phone_status = validatePhoneNumber.validate(countrycode_phone);

    if(phone_status != true){
        error.invalid_phone(server, phone_number); return
    }


    const user_address = new UserAddress({
        _id: new mongoose.Types.ObjectId(),
        name: name,
        user_id: user_id,
        address_line1: address_line1,
        address_line2: address_line2,
        city: city,
        postal_code: postal_code,
        country: country,
        mobile:phone_number,
        status: 'active'
    });

    try {
        const savedUserAddress =  await user_address.save();
    
        var api_response = {
            _id: user_address._id,
            result: savedUserAddress
        };

        var msg = "User address added successfull";

        status.success(server,api_response,msg); return;
    
    } catch (err) {
        res.status(400).send(err); return;
    }

});



//user address update
router.put('/address/update', async (req, res) => {

    console.log(req.body);

    var server = { req: req, res: res };

    var id = req.body.id;
    var name = req.body.name;
    var user_id = req.body.user_id;
    var address_line1 = req.body.address_line1;
    var address_line2 =  req.body.address_line2;
    var city = req.body.city;
    var postal_code = req.body.postal_code;
    var country = req.body.country;
    var phone_number =  req.body.phone_number;

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

    if(typeof(user_id)=='undefined'){
        error.param_required(server,'user id parameter required','user_id'); return;
    }

    if((user_id).trim()==''){
        error.required(server,'user id is required'); return;
    }

    if(typeof(address_line1)=='undefined'){
        error.param_required(server,'address line1 parameter required','address_line1'); return;
    }

    if((address_line1).trim()==''){
        error.required(server,'address line1  is required'); return;
    }

    if(typeof(address_line2)=='undefined'){
        error.param_required(server,'address line2 parameter required','address_line2'); return;
    }

    if((address_line2).trim()==''){
        error.required(server,'address line2  is required'); return;
    }

    if(typeof(city)=='undefined'){
        error.param_required(server,'city parameter required','city'); return;
    }

    if((city).trim()==''){
        error.required(server,'city  is required'); return;
    }

    if(typeof(postal_code)=='undefined'){
        error.param_required(server,'postal code parameter required','postal_code'); return;
    }

    if((postal_code).trim()==''){
        error.required(server,'postal code is required'); return;
    }

    if(typeof(country)=='undefined'){
        error.param_required(server,'country parameter required','country'); return;
    }

    if((country).trim()==''){
        error.required(server,'country is required'); return;
    }


    if(typeof(phone_number)=='undefined'){
        error.param_required(server,'phone number parameter required','phone_number'); return;
    }

    if((phone_number).trim()==''){
        error.required(server,'phone number is required'); return;
    }

    var countrycode_phone = "+91"+phone_number;
    const phone_status = validatePhoneNumber.validate(countrycode_phone);

    if(phone_status != true){
        error.invalid_phone(server, phone_number); return
    }

    try {

        var upt_user_address = {
            $set: {
                name: name,
                user_id: user_id,
                address_line1: address_line1,
                address_line2: address_line2,
                city: city,
                postal_code: postal_code,
                country: country,
                mobile:phone_number,
                status: 'active'
            }
        };
        const uptUserAddress =  await UserAddress.updateOne({_id: mongoose.Types.ObjectId(id)}, upt_user_address);
    
        var api_response = {
            result: uptUserAddress
        };

        var msg = "User address updated successfully";

        status.success(server,api_response,msg); return;
    
    } catch (err) {
        res.status(400).send(err); return;
    }

});


//user address delete
router.delete('/address/delete', async (req, res) => {

    console.log(req.body);

    var server = { req: req, res: res };

    var id = req.body.id;

    if(typeof(id)=='undefined'){
        error.param_required(server,'id parameter required','id'); return;
    }

    if((id).trim()==''){
        error.required(server,'id is required'); return;
    }

    try {

        const deleteUserAddress = await UserAddress.deleteOne({_id: mongoose.Types.ObjectId(id)});

        var api_response = {
            result: deleteUserAddress
        };

        var msg = "User address deleted successfully";

        status.success(server, api_response, msg);
        
    } catch (err) {
        res.status(400).send(err); return;
    }

});

//user address list
router.get('/address/list', async (req, res) => {


    var server = { req: req, res: res };

    var user_id = req.query.user_id;


    if(typeof(user_id)=='undefined'){
        error.param_required(server,'user id parameter required','user_id'); return;
    }

    if((user_id).trim()==''){
        error.required(server,'user id is required'); return;
    }

    try {
        const user_address_list =  await UserAddress.find({user_id: mongoose.Types.ObjectId(user_id)});
        
        if(user_address_list.length > 0){
            var api_response = {
                total_records: user_address_list.length,
                result: user_address_list
            };
            var msg = "User address list found";
    
            status.success(server,api_response,msg); return;
        }else{
            status.no_record(server); return;
        }
    
    } catch (err) {
        res.status(400).send(err); return;
    }

});

//forgot password OTP verify email sending to respective account
router.post("/forgot-password/otp-verfy", async (req, res) => {

    var server = { req:req, res:res };

    var email_address = req.body.email_address;

    if(typeof(email_address)=='undefined'){
        error.param_required(server,'email address parameter required','email_address'); return;
    }

    if((email_address).trim()==''){
        error.required(server,'email address is required'); return;
    }

    if(emailValidator.validate(email_address) != true){
        error.invalid_email(server, email_address); return
    }

    email_address = email_address.toLowerCase();


    const userInfo = await User.findOne({email_address: email_address}, { password: 0 })
    
    if(userInfo){

        //generate OTP
        var otp_digits =  otpGenerator.generate(4, { digits: true, lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false });

        //Generate email data   
        var html_data = '<div style="font-family:Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2"><div class="adM"></div><div style="margin:50px auto;width:70%;padding:20px 0"><div class="adM"> </div><div style="border-bottom:1px solid #eee"><div class="adM"> </div><a style="font-size:1.4em;color:#00466a;text-decoration:none;font-weight:600">Ekart</a> </div><p style="font-size:1.1em">Hi #user_name,</p><p>Please enter below OTP to reset your account password.</p><h2 style="background:#00466a;margin-left: 150px; width:max-content;padding:0 10px;color:#fff;border-radius:4px">#otp_no</h2> <p style="font-size:0.9em">Regards,<br>Ekart <br>Website: www.ekart.in <br></p><hr style="border:none;border-top:1px solid #eee"> <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300"> <p>Ekart</p><p>Coimbatore</p><p>Tamil Nadu</p><p>India</p><div class="yj6qo"></div><div class="adL"> </div></div><div class="adL"></div></div><div class="adL"></div></div>';
          
        var html_data_final =  html_data.replace(/#user_name/g, userInfo.first_name+' '+userInfo.last_name).replace(/#otp_no/g, otp_digits);
            
        //update into users collection 
        var upt_data = { $set: { otp: otp_digits, otp_status: 'inactive' } };
        const userOTPUpt = await User.updateOne({email_address: email_address}, upt_data);
            let mailTransporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.GMAIL_AUTH_EMAIL,
                    pass: process.env.GMAIL_AUTH_PWD
                }
            });
        
            let mailDetails = {
                from: process.env.GMAIL_AUTH_EMAIL,
                to: userInfo.email_address,
                subject: 'Ekart account password reset OTP verification',
                html: html_data_final
            };
        
            mailTransporter.sendMail(mailDetails, function(err, data) {
                if(err) {
                    res.staus(400).send(err);  return;
                } else {
                   //res.send(userInfo); return;
                   var msg = "Forgot password OTP verfication send to your email, Please check";
                   var api_response = {
                       user_id: userInfo._id,
                       result: userOTPUpt,
                       redirect_url: config.base_url+"/user/reset-password?user_id="+userInfo._id
                   }
                   status.success(server,api_response,msg); return;
                }
            });

        
    }


});


//otp verify
router.post("/otp-verify", async (req, res) => {
    var server = { req:req, res:res };

    var user_id = req.query.user_id;

    var otp = req.body.otp;

    if(typeof(user_id)=='undefined'){
        error.param_required(server,'user id parameter required','user_id'); return;
    }

    if((user_id).trim()==''){
        error.required(server,'user id is required'); return;
    }

    if(typeof(otp)=='undefined'){
        error.param_required(server,'otp parameter required','otp'); return;
    }

    if(!Number(otp)){
        error.required(server,'otp field must be number'); return;
    }

    try {

        const userInfo = await User.findByIdAndUpdate({_id: mongoose.Types.ObjectId(user_id)}, {otp: 0, otp_status: 'active'});

        var msg = "User OTP verified successfully";

        var api_response = {
            result: userInfo,
            redirect_url: config.base_url+"/user/reset-password"
        }

        status.success(server,api_response,msg); return;

    } catch (err) {

        res.status(400).send(err); return;

    }
    

});

//reset password
router.post("/reset-password", async (req, res) => {

    var server = { req:req, res:res };

    var user_id = req.body.user_id;

    var new_password = req.body.new_password;

    var confirm_password = req.body.confirm_password;

    if(typeof(user_id)=='undefined'){
        error.param_required(server,'user id parameter required','user_id'); return;
    }

    if((user_id).trim()==''){
        error.required(server,'user id is required'); return;
    }


    var pass_valid = new passwordValidator();
    pass_valid.is().min(4).is().max(25);

    //new pwd
    if(typeof(new_password)=='undefined'){
        error.param_required(server,'new password parameter required','new_password'); return;
    }

    if((new_password).trim()==''){
        error.required(server,'new password is required'); return;
    }
    if(pass_valid.validate(new_password) != true ){
        error.invalid_password(server); return
    }

    //confirm pwd
    if(typeof(confirm_password)=='undefined'){
        error.param_required(server,'confirm password parameter required','confirm_password'); return;
    }

    if((confirm_password).trim()==''){
        error.required(server,'confirm password is required'); return;
    }
    if(pass_valid.validate(confirm_password) != true ){
        error.invalid_password(server); return;
    }

    if(new_password != confirm_password){
        error.new_confirm_password_mismatch(server); return;
    }

    //Hash password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(new_password, salt);

    
    try {
        
        const userUpt = await User.findByIdAndUpdate({_id: mongoose.Types.ObjectId(user_id)}, { password: hashPassword });

        var msg = "User password changed successfully";

        var api_response = {
            result: userUpt,
        }

        status.success(server,api_response,msg); return;

    } catch (err) {

        res.status(400).send(err); return;
        
    }
});

//user profile upload
router.post('/profile-picture-upload', upload.single('user_image'), async (req, res) => {
    var server = { req:req, res:res };

    var filename = req.file.filename;
    //var originalname = req.file.originalname;
    var file_path = req.file.destination+''+filename;

    var user_id = req.body.user_id;

    if(typeof(user_id)=='undefined'){
        error.param_required(server,'user id parameter required','user_id'); return;
    }

    if((user_id).trim()==''){
        error.required(server,'user id is required'); return;
    }

    try {

        //delete existing profile image from uploaded path

        const userInfo = await User.findOne({_id: mongoose.Types.ObjectId(user_id)}, { user_image_path:1, user_image_name:1});
        
        if(userInfo.user_image_name != null){
            fs.unlink(userInfo.user_image_path, function(err){
                if(err){
                    error.existing_file_delete_error(server); return;
                }
            })
        }
        // console.log(userInfo);

        // res.send(userInfo); return;

        //update user image

        var upt_data = { $set: {user_image_path: file_path, user_image_name: filename} };

        const userImageUpt = await User.updateOne({_id: mongoose.Types.ObjectId(user_id)}, upt_data);

        var msg = "User profile picture update successfully";

        var api_response = {
            result: userImageUpt
        }
        status.success(server,api_response,msg); return;
        
    } catch (err) {
        res.status(400).send(err); return;
    }
    
});

//user info
router.get('/profile/:id', async (req, res) => {

    var server = {req:req, res:res};

    var id = req.params.id;

    if(typeof(id)=='undefined'){
        error.param_required(server,'id parameter required','id'); return;
    }

    if((id).trim()==''){
        error.required(server,'id is required'); return;
    }

    //console.log(id);  res.send(id); return;

    try {

        const userInfo = await User.findOne({_id: mongoose.Types.ObjectId(id)});

        var api_response = {
            result: userInfo
        };

        var msg = "User info found";

        status.success(server, api_response, msg);
        
    } catch (err) {
        res.status(400).send(err); return;
    }
    

});

//user token create
router.post("/notification-token-create", async (req, res) => {

    var server = {req:req, res:res };

    
    //.log(req.body);
    //return false;
    var token = req.body.token;
    var device_type = req.body.device_type;
    var user_id = req.body.user_id;

    const userNotifyToken = new UserNotificationToken({
        _id: new mongoose.Types.ObjectId(),
        user_id: user_id,
        token: token,
        device_type: device_type

    });

    try {
        const savedUserNotifyToken = await userNotifyToken.save();
        var api_response = {
            _id:savedUserNotifyToken._id,
            result: savedUserNotifyToken
        };
        var msg = "Token successfully added to server"; 
        status.success(server,api_response,msg);
    } catch (err) {
        res.status(400).send(err);
    }



});
module.exports = router;