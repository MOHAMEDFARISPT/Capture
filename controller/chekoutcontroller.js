const usermodel=require("../model/userschema")
const productmodel=require('../model/productschema')
const categorymodel=require('../model/categoryschema')
require('dotenv').config();
const nodemailer = require('nodemailer');
const randomstring = require('randomstring');
const session=require('express-session');
const { productlist } = require('./productcontroller');
const { EventEmitterAsyncResource } = require('nodemailer/lib/xoauth2');
const { query } = require('express');
const addressModel = require('../model/addressschema');
const cartmodel=require("../model/cartschema")
const Order=require("../model/orderschema");
const { product } = require("./usercontroller");








const checkoutget=async(req,res)=>{
    try{
        console.log("sdsddsddsdsdsdsds")
    let userloggedin = false;
    if(req.session && req.session.userdata){
      userloggedin=true;
    }
    console.log("sdsddsddsdsdsdsds")
    const userId=req.session.userdata._id;
    const userCart=await cartmodel.findOne({user:userId}).populate('products.product');
    console.log("sdsddsddsdsdsdsds")
    const address=await addressModel.findOne({user:req.session.userdata});
    console.log("sdsddsddsdsdsdsds")
  
    if(address){
        console.log("sdsddsddsdsdsdsds")
      res.render("user/checkout",{userCart,address,userloggedin})
    }
    res.render("user/checkout",{userCart,address,userloggedin})
}catch(err){
    console.log(err)
}
    
  }


const addaddress=async(req,res)=>{
    const { fullname, contact, pincode, state, address, locality, district } = req.body;

    const newaddress = {
        fullname,
        contact,
        pincode,
        state,
        address,
        locality,
        district
    };

    console.log(newaddress);
    try {
        const existingAddress = await addressModel.findOne({ user: req.session.userdata._id });
    
        if (existingAddress) {
          const addressexist = existingAddress.addresses.some(addr => (
            addr.fullname == fullname &&
            addr.contact == contact &&
            addr.pincode == pincode &&
            addr.state == state &&
            addr.address == address &&
            addr.locality == locality &&
            addr.district == district  // Fix the typo here
          ));
    
          if (addressexist) {
            return res.status(400).json({ message: 'Address already exists' });
          }
    
          existingAddress.addresses.push(newaddress);
          await existingAddress.save();
        } else {
          console.log("id"+req.session.userdata._id);
          const newentry = new addressModel({ user: req.session.userdata._id, addresses: [newaddress] });
          console.log("new wntryyy"+newentry);
          await newentry.save();
          res.status(200).json({message:"new address successfully addedd"})
      // Redirect after sending JSON response
        }
        
    
       
        
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
      }
    };


    const deleteaddress = async (req, res) => {
        try {
            const addressId = req.params.addressId;
    
           
            const userId = req.session.userdata; 
            const user = await addressModel.findOne({ user: userId });

            if (user) {
                // Filter out the address with the given addressId
                user.addresses = user.addresses.filter(addr => addr._id.toString() !== addressId);
                
                // Save the updated user object back to the database
                await user.save();
            
                console.log("Updated user:", user);
                res.status(200).json({ message: 'Address deleted successfully' });
            } else {
                res.status(404).json({ error: 'User not found' });
            }
            
    
           
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    };
    



















  const selectionbox = async (req, res) => {
    try {
        console.log("req.body.productId//////////" + req.params.productId);

        const productId = req.params.productId;
        console.log("product");
        const userId = req.session.userdata._id;

        let usercart = await cartmodel.findOne({ user: userId });
       

        usercart.products.forEach((product) => {
            if (product.product.toString() === productId) {
                product.isSelected = !product.isSelected;
            }
        });

        await usercart.save();
        res.status(200).json({ message: "Successfully selected" });
    } catch (error) {
        console.error("Error in selectionbox:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};







const addresspaymentmethod = async (req, res) => {
    const selectedAddressId = req.body.selectedAddressId;
    const selectedPaymentMethod = req.body.selectedPaymentMethod;
    const userId = req.session.userdata._id;

    try {
        const user = await addressModel.findOne({ user: userId });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const selectedAddress = user.addresses.find(
            (address) => address._id.toString() === selectedAddressId
        );

        if (!selectedAddress) {
            return res.status(404).json({ message: 'Address not found' });
        }

        const selectedProducts = await cartmodel.findOne({ user: userId })
            .populate('products.product');

        const cartProducts = selectedProducts.products.filter((item) => item.isSelected === true);

        const order = new Order({
            userId: userId,
            paymentMethod: selectedPaymentMethod,
            address: {
                name: selectedAddress.fullname,
                mobile: selectedAddress.contact,
                homeAddess: selectedAddress.address,
                pincode: selectedAddress.pincode,
                locality: selectedAddress.locality,
                city: selectedAddress.district,
                state: selectedAddress.state,
                altphone: selectedAddress.altphone,
            },
            products: [],
            totalAmount: 0,
        });

        for (const cartProduct of cartProducts) {
            const productData = {
                productId: cartProduct.product._id,
                quantity: cartProduct.quantity,
                salesPrice: cartProduct.product.price,
                total: cartProduct.quantity * cartProduct.product.price,
                reason: '',
            };

            order.products.push(productData);
            order.totalAmount += productData.total;

            const product = await productmodel.findById(productData.productId);

            if (!product || product.quantity < cartProduct.quantity) {
                return res.status(400).json({ message: 'Invalid product or insufficient quantity.' });
            }

            product.quantity -= cartProduct.quantity;
            await product.save();
        }

        await order.save();

        res.status(200).json({ message: 'Order placed successfully' });
    } catch (error) {
        console.error('Error processing order:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};


  module.exports={
    checkoutget,
    addaddress,
    deleteaddress,
    selectionbox,
    addresspaymentmethod


  }