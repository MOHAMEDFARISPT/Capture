const cartmodel=require("../model/cartschema")
const express = require('express');
const router = express.Router();
const multer=require('multer')
const path=require('path');
const { findById } = require("../model/userschema");
const productmodel=require("../model/productschema");
const categorymodel=require("../model/categoryschema")
const { category } = require("./usercontroller");
const usermodel=require('../model/userschema')
const wishlistModel=require('../model/wishlistschema')
const walletmodel=require("../model/walletschema")
require('dotenv').config();
const  Razorpay=require("razorpay")
const Order=require("../model/orderschema");




const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
const razorpayKeySecret = process.env.RAZORPAY_SECRET_KEY;
const razorpayInstance = new Razorpay({
    key_id: razorpayKeyId,
    key_secret: razorpayKeySecret,
});

const addwalletamount=async(req,res)=>{
    const amount=req.body.amount
    console.log("amount",amount)
    const userId=req.session.userdata._id

    const options = {
        amount: amount , 
        currency: 'INR',
        receipt: 'order_receipt_123',
        payment_capture: 1,
    };

    try {
        const order = await razorpayInstance.orders.create(options);
        console.log("order",order)
        res.json({order,key_id:razorpayKeyId});
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
;

}






const verifyrazorpay=async(req,res)=>{
try {
    const userId=req.session.userdata._id
    const crypto=require('crypto')
    console.log(req.body);
        const{
            orderCreationId,
            amount,
            razorpayPaymentId,
            razorpayOrderId,
            razorpaySignature

        }=req.body.data;
        console.log( "!!!!!!!!",orderCreationId,amount,razorpayPaymentId,razorpayOrderId,razorpaySignature)

        const shasum=crypto.createHmac("sha256",razorpayKeySecret);
        shasum.update(`${orderCreationId}|${razorpayPaymentId}`)

        const digest=shasum.digest('hex');

        if(digest!==razorpaySignature){
            console.log(("???????/"));
            return res.status(400).json({msg:'transaction not legit'})
        }
        const founWallet=await walletmodel.findOne({user:userId})
        console.log("foundwallet",founWallet)

        founWallet.balance += amount
        founWallet.transactions.push({
            amount:amount,
            type:'credit',
            description:'Top-Up',
        })

      await founWallet.save()

       res.status(200).json({message:"payment addedd to  wallet successfully"}) 







} catch (error) {
    
}
    

}



module.exports={
    addwalletamount,
    verifyrazorpay
}