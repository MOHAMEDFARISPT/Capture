const mongoose = require('mongoose');
const { Schema, Types } = mongoose;

const wishlistchema = new Schema({
    user: {
        type: Types.ObjectId,
        ref: 'users'
    },
    products: [{
        product: {
            type: Types.ObjectId,
            ref: 'Product'
        },
        quantity: {
            type: Number
        },
        isSelected: {
            type: Boolean,
            default:false
        }

    }],
    totalamount: {
        type: Number
    },
    
}, { timestamps: true });

const wishlistModel = mongoose.model('wishlist', wishlistchema);
module.exports = wishlistModel;
