const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    couponcode: {
        type: String,
        unique:true
    },
    description: {
        type: String
    },
    users_used: [{
        type:  mongoose.Schema.Types.ObjectId,
        ref: 'users'
    }],
    discount_percentage: {
        type: Number,
        min: 0,
        max: 100
    },
    max_discount_amount: {
        type: Number,
        min: 0
    },
    min_amount: {
        type: Number,   
        min: 0
    },
    max_amount: {
        type: Number,
        min: 0
    },
    status: {
        type: String,
        default: 'Active'
    },
    expiry_date: {
        type: Date
    },
    islisted:{
        type:Boolean,
        default:false
    },
    isExpired:{
        type:Boolean,
        default:true
    }
   
});

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon;
