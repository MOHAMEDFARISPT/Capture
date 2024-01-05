const mongoose = require('mongoose');
const crypto=require('crypto')

const orderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        unique: true,
        default: function () {
            const randomString = crypto.randomBytes(6).toString('hex').toUpperCase();
            return `ord${randomString}`;
        },
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required:true
    },
    date: {
        type: Date,
        default: Date.now(),
       
    },
    totalAmount: {
        type: Number,
        
    },
    paymentMethod: {
        type: String,
        required:true
      
    },
    products: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
            },
            quantity: {
                type: Number,
                
            },
            salesPrice: {
                type: Number,
                
               
            },
            total: {
                type: Number,
               
              
            },
            cancelstatus: {
                type: String,
                default: 'pending',
                enum:['pending','processing','shipped','delivered','canceled','returned','failed']
            },
            reason: {
                type: String,
            },
        },
    ],
    address: {
        name: {
            type: String,
            
        },
        mobile: {
            type: Number,
           
        },
        homeAddess: {
            type: String,
            
        },
        pincode: {
            type: Number,
            
        },
        locality: {
            type: String,
            
        },
        city: {
            type: String, // Corrected: 'String' instead of 'string'
           
        },
        state: {
            type: String,
            
        },
        altphone: {
            type: String,
        },
        isDefault: {
            type: Boolean,
           
        },
    },
    orderStatus: {
        type: String,
        default: 'pending',
        enum:['pending','processing','shipped','delivered','canceled','returned','failed']
    },
    deliverdDate: {
        type: Date,
        default: '',
    },
    paymentStatus: {
        type: String,
        default: 'pending',
    },
}, {
    timestamps: true, // Corrected: Use 'timestamps' instead of 'timeseries'
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
