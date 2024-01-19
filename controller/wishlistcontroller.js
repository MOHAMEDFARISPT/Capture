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




const wishlist = async (req, res) => {
    try {
        let userloggedin = false;
        if (req.session && req.session.userdata) {
            userloggedin = true;
        }
        const userId = req.session.userdata._id;

        const userwishlist = await wishlistModel.findOne({ user: userId }).populate('products.product');
        console.log("userwishlist", userwishlist);
        console.log("wishlist", userwishlist);

        res.render("user/wishlist", { userwishlist, userloggedin });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
};

  
  
  const addtowishlist = async (req, res) => {
    try {
        const productId = req.body.productId;
        const userId = req.session.userdata._id;

   

        // Check if the user has a wishlist
        let userwishlist = await wishlistModel.findOne({ user: userId });

        if (!userwishlist) {
            // If the user doesn't have a wishlist, create one
            userwishlist = new wishlistModel({
                user: userId,
                products: [],
                totalamount: 0
            });
        }

        // Check if the product already exists in the wishlist
        const existingProduct = userwishlist.products.find(product => product.product.toString() === productId);
        if (existingProduct) {
            return res.status(400).json({ message: 'Product already exists in the wishlist' });
        }

        // Find the product based on the productId (Assuming you have a Product model)
        const product = await productmodel.findById(productId);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Add the product to the wishlist
        userwishlist.products.push({
            product: productId,
            productname: product.name, // Assuming your product model has a 'name' field
            price: product.price, // Assuming your product model has a 'price' field
            quantity: 1, // You can adjust the quantity as needed
            isSelected: false,
        });

        // Update the total amount
        userwishlist.totalamount += product.price;

        // Save the changes to the database
        await userwishlist.save();
     

        res.status(200).json({ message: 'Product added to wishlist successfully' });
    } catch (error) {
        console.error('Error adding product to wishlist:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


const removewishlist = async (req, res) => {
    const wishlistItemId = req.params.id;
    const userId = req.session.userdata._id;

    try {
        const user = await wishlistModel.findOne({ user: userId });

        if (!user) {
            return res.status(404).json({ message: 'Wishlist not found' });
        }

        // Filter out the product with the specified ID
        user.products = user.products.filter(item => item.product.toString() !== wishlistItemId);

        console.log("user.products", user.products);

        await user.save();

        res.status(200).json({ message: 'Wishlist item removed successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


    
    
  
  
  


  module.exports={
    wishlist,
    addtowishlist,
    removewishlist
  }