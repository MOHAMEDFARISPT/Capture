const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const addressSchema = new Schema({
    addresses: [{
        fullname: {
            type: String,
            required: true
        },
        contact: {
            type: String,
            required: true
        },
        pincode: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: true
        },
        locality: {
            type: String,
            required: true
        },
        district:{
            type:String,
            required:true
        }
       
    }],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
}, {
    timestamps: true  // Corrected field name
});

const addressModel = mongoose.model('address', addressSchema);

module.exports = addressModel;
