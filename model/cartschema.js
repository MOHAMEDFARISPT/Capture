const mongoose = require('mongoose');
const { Schema, Types } = mongoose;

const cartSchema = new Schema({
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

const cartModel = mongoose.model('cart', cartSchema);
module.exports = cartModel;
