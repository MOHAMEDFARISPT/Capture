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






const cartpost=async(req,res)=>{
    const productId=req.params.productId;
    const quantity=req.body.quantity || 1;
    const userId=req.session.userdata._id;

    try{
    
        let usercart=await cartmodel.findOne({user:userId})

        if(!usercart){
            usercart=new cartmodel({
                user:userId,
                products:[],
                totalamount:0
            });
        }
        const existingproduct= usercart.products.find((product)=>product.product.toString()===productId
        );
        if(existingproduct){
            existingproduct.quantity +=quantity
        }else{
            usercart.products.push({product:productId,quantity})

        }

        let totalamount=0;
        for(const product of usercart.products){
            console.log("product"+product);
            const productdetailes=await productmodel.findById(product.product);
            totalamount +=product.quantity * productdetailes.price;
        }
        usercart.totalamount=totalamount;
        await usercart.save()
        res.status(200).send("product added to cart successfully")

    }catch(error){
        console.error(error)
        res.status(500).send("internal server error")
    }


}





const cart=async(req,res)=>{
    try {
        let userloggedin = false;
        if(req.session && req.session.userdata){
          userloggedin=true;
        }
        const userId=req.session.userdata._id;
        console.log("idddd"+userId)
        
       //find the users cart,populate product detailes
       const userCart=await cartmodel.findOne({user:userId}).populate('products.product')
       console.log("usercarttttttt"+userCart)
       res.render("user/cart",{userCart,userloggedin});
        
    } catch (error) {
        console.error(error)
        res.status(500).send("internal server error ")
        
    }

}




const updateQuantity = async (req, res) => {
    try {
    const productId = req.body.productId; // Access productId from the request body
    const quantity = req.body.quantity; // New quantity value to update
    const userId = req.session.userdata._id;
    let userCart = await cartmodel.findOne({ user: userId }).populate('products.product');
    console.log(userCart);
    const existingProduct = userCart.products.find(
        (product) => product.product._id.toString() === productId
    );
    if(quantity > existingProduct.product.currentQut){
        res.status(500).send("quantity exceeded")
    }
    existingProduct.quantity = quantity;
    let totalAmount = 0;
        for (const product of userCart.products) {
            const productDetails = await productmodel.findById(product.product._id);
            totalAmount += product.quantity * productDetails.price;
        }

        userCart.totalamount = totalAmount;

        // Save the updated cart
        await userCart.save();
   
    

        res.redirect('/cart'); // Redirect to '/cartdisplay' after updating carts
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error'); // Handle error appropriately
    }
}









//cart deletion

const Cartiteamdelete = async (req, res) => {
    console.log(req.params.productId)
    try {
        const productIdToDelete = req.params.productId;
        console.log("//productid///" + productIdToDelete);

        const userId = req.session.userdata._id;
        console.log((userId));
        const user = await cartmodel.findOne({user:userId});
        console.log(user);
        if (user) {  // Check if user and user.cart are defined
            // Filter the user's cart to exclude the selected product
            user.products = user.products.filter(product => product.product.toString() !== productIdToDelete);
            console.log(user.products);

            // Save the updated user to the database
            await user.save();

            res.status(200).json({ success: true, message: 'Product removed from the cart.' });
            console.log("item deleted");
            res.status(200)
        } else {
            res.status(404).json({ success: false, message: 'User not found or user.cart is undefined.' });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};



        
   
    
    
    
   








  






module.exports={
   cartpost,
   cart,
   updateQuantity,
   Cartiteamdelete,
   
   

}


