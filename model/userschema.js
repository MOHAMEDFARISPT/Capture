const mongoose=require('mongoose')
const Schema=mongoose.Schema;
const bcrypt=require('bcrypt');
const crypto = require('crypto')
const userSchema=new Schema({
    firstname:String,
    lastname:String,
    contact:{
        type:String,
    },

    email:{
       type: String
    },
    password:{
        type:String
    },
    isblocked:{
        type:Boolean,
        default:false
    },
    resetpasswordToken: { // Corrected property name
        type: String,
    },
    resetpasswordExpire: {
        type: Date,
    },
},{
    timestamps:true
})




//generate  and  hash password tocken
userSchema.methods.getResetpasswordToken = function () {
    const resetToken = crypto.randomBytes(20).toString('hex');

    this.resetpasswordToken = crypto
        .createHash('sha256') // Use a proper algorithm like sha256
        .update(resetToken)
        .digest('hex');

    this.resetpasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    return resetToken;
};










const model=mongoose.model('users',userSchema)

module.exports=model;