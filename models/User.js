const mongoose = require('mongoose');

//user schema
const userSchema = new mongoose.Schema({
    first_name: { type: String, trim:true },
    last_name: { type: String, trim: true },
    email_address: { type: String, trim: true },
    phone_number: { type: String, trim: true },
    password: { type: String, trim: true, max: 1024,  min:4 },
    profile_pic: { type: String, default: ''},
    status: { type: String },
    otp: { type: Number, default: 0 },
    otp_status: { type: String , default: ''},
    user_image_path: { type: String, default: '' },
    user_image_name: { type: String, default: '' },
    created_date: { type: Date, default: Date.now },
    updated_date: { type: Date, default: Date.now }
});

//Creating user model object
const User = mongoose.model('users', userSchema);

//user address schema
const userAddressSchema = new mongoose.Schema({
    _id : mongoose.Schema.Types.ObjectId,
    name: { type: String, trim: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref:'users' },
    address_line1: { type: String, trim: true },
    address_line2: { type: String, trim: true },
    city: { type: String, trim: true },
    postal_code: { type: String, trim: true },
    country: { type: String, trim: true },
    telephone: { type: String, default:'' },
    mobile: { type: String, default: '' },
    status: { type: String },
    created_date: { type: Date, default: Date.now },
    updated_date: { type: Date, default: Date.now }
});

//Creating user model object
const UserAddress = mongoose.model('user_address', userAddressSchema);

//User notification token
const userNotificationTokenSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    user_id: { type: mongoose.Schema.Types.ObjectId, ref:'users' },
    token: { type: String, trim: true },
    device_type: { type: String, trim: true },
    created_date: { type: Date, default: Date.now },
    updated_date: { type: Date, default: Date.now }

});

//Creating user model object
const UserNotificationToken = mongoose.model('user_notification_token', userNotificationTokenSchema);

//Exporting model following model objects
module.exports = {
    User,
    UserAddress,
    UserNotificationToken
};
