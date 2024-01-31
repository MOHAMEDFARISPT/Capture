const cartmodel=require("../model/cartschema")
const express = require('express');
const router = express.Router();
const multer=require('multer')
const path=require('path');
const { findById } = require("../model/userschema");
const productmodel=require("../model/productschema");
const categorymodel=require("../model/categoryschema")
const { category } = require("./usercontroller");
const usermodel=require('../model/userschema');
const couponmodel=require('../model/couponschema')






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
            if(product.isSelected){
            console.log("product"+product);
            const productdetailes=await productmodel.findById(product.product);
            totalamount +=product.quantity * productdetailes.price;
          
            }
        }
        usercart.totalamount=totalamount;
        console.log("usercart",usercart)
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
          userloggedin=true;    ``
        }
        const userId=req.session.userdata._id;
      

          // Check for a session message
          const sessionMessage = req.session.message;
          // Clear the session message to avoid displaying it multiple times
          req.session.message = null;
        
       //find the users cart,populate product detailes
       const userCart=await cartmodel.findOne({user:userId}).populate('products.product')
       const coupon=await couponmodel.find({})
      
    
    
       res.render("user/cart",{userCart,coupon,userloggedin,sessionMessage});
        
    } catch (error) {
        console.error(error)
        res.status(500).send("internal server error ")
        
    }

}







const couponapply = async (req, res) => {
    try {
        const couponId = req.params.couponId;
        const userId = req.session.userdata._id;
      

        // Fetch the user's cart
        const cart = await cartmodel.findOne({ user: userId }).populate('products.product');
      

        // Fetch coupon details
        const coupondata = await couponmodel.findOne({ _id: couponId });
      

        // Check if the coupon exists
        if (!coupondata) {
            console.log("Coupon not found");
            return res.status(200).json({ success: false, message: 'Coupon not found.' });
        }

        // Check if the coupon has already been applied by the current user
        if (coupondata.users_used.includes(userId)) {
           
            return res.status(200).json({ success: false, message: "Coupon has already been applied by the current user." });
        }

        // Check if a coupon is already applied
        if (cart.couponDetails.appliedCoupon === coupondata.couponcode) {
            return res.status(200).json({ success: false, message: "You have already applied this coupon." });
        }

        // Check if the coupon has expired
        const currentDate = new Date();
        if (coupondata.expiry_date && currentDate > new Date(coupondata.expiry_date)) {
            coupondata.isExpired = true;
            coupondata.status = 'Expired';
            await coupondata.save();
            return res.status(200).json({ success: false, message: "Coupon has expired." });
        }

        console.log("Total amount before discount:", cart.totalamount);
        if (cart.couponDetails.appliedCoupon) {
            let TotalAmount = 0;
            for (const product of cart.products) {
                if (product.isSelected) {
                    console.log("product" + product);
                    const productdetailes = await productmodel.findById(product.product);
                    TotalAmount += (product.quantity * productdetailes.price);
                   
                }
            }
      
            cart.originalAmount = TotalAmount;
            // Revert the effects of the previously applied coupon
            cart.totalamount = TotalAmount; // Set totalamount back to the original total
            cart.appliedCoupon = null; // Clear the applied coupon
            cart.couponDetails.discountedAmount=0

            // Save the changes
            await cart.save();
            console.log(cart)

        }
        // Apply the discount
        const { totalamount } = cart;
        const { discount_percentage, max_discount_amount } = coupondata;
        const discountedAmount = (totalamount * discount_percentage) / 100;
        const orginalAmountDiscounted = Math.min(discountedAmount,max_discount_amount)
        const discountedTotal = Math.round(totalamount-orginalAmountDiscounted);
        console.log((totalamount - discountedAmount), (totalamount - max_discount_amount))
        // Check if the discount based on percentage is greater than max_discount_amount
        const finalDiscountedAmount = discountedAmount > max_discount_amount ? max_discount_amount : discountedAmount;

        console.log("Discounted amount:", finalDiscountedAmount);
        console.log("Total amount after discount:", discountedTotal);
        console.log(orginalAmountDiscounted+"jdfjdsjdskjsd")

        // Check if the discount amount is applicable for the products' order total amount
            // Update the cart properties
            req.session.totalPrice = discountedTotal; // Assuming you want to update the session total price
            cart.totalamount = discountedTotal;
            cart.couponDetails.appliedCoupon = coupondata.couponcode;
            cart.couponDetails.discountedAmount=orginalAmountDiscounted;

            // const averageAmountPerProduct = totalSelectedProducts > 0 ? totalAmountPerProduct / totalSelectedProducts : 0;

            // Add the user to the list of users who have used this coupon
            // coupondata.users_used.push(userId);

            // Save the changes
            await cart.save();
            await coupondata.save();

            console.log("Updated cart:", cart);
            console.log("Updated coupondata:", coupondata);

            return res.status(200).json({
                success: true,
                message: 'Coupon applied successfully!',
                discountedTotal,
                discountedAmount: finalDiscountedAmount,
                maxDiscountAmount: max_discount_amount, // Include max_discount_amount in the response
            });
        // } else {
        //     return res.status(200).json({
        //         success: false,
        //         message: 'Discount amount exceeds the total amount. Coupon cannot be applied.',
        //     });
        // }

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};





const removeCoupon = async (req, res) => {
    
    try {
        const userId = req.params.userId;

        // Fetch the user's cart and remove the applied coupon
        const userCart = await cartmodel.findOne({ user: userId });

        if (!userCart) {
            return res.status(404).json({ success: false, message: 'User cart not found.' });
        }

        if (!userCart.couponDetails.appliedCoupon) {
            return res.status(200).json({ success: false, message: 'No coupon applied.' });
        }

        // Update the cart's totalamount and appliedCoupon properties accordingly

        let TotalAmount = 0;
        for (const product of userCart.products) {
            if (product.isSelected) {
                console.log("product" + product);
                const productdetailes = await productmodel.findById(product.product);
                TotalAmount += (product.quantity * productdetailes.price);
               
            }
        }
       
        // Revert the effects of the previously applied coupon
        userCart.totalamount = TotalAmount; // Set totalamount back to the original total
        userCart.couponDetails.appliedCoupon = null; // Clear the applied coupon
        userCart.couponDetails.discountedAmount=0

        // Save the changes
        // Save the changes to the database
        await userCart.save();

        // Respond with appropriate JSON indicating success
        console.log("coupon removed successfully")
        return res.status(200).json({ success: true, message: 'Coupon removed successfully.' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};




















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
            if(product.isSelected){
            const productDetails = await productmodel.findById(product.product._id);
            totalAmount += product.quantity * productDetails.price;
            }
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
       

        const userId = req.session.userdata._id;
        console.log((userId));
        const user = await cartmodel.findOne({user:userId});
        console.log(user);
        if (user) {  // Check if user and user.cart are defined
            // Filter the user's cart to exclude the selected product
            user.products = user.products.filter(product => product.product.toString() !== productIdToDelete);
            console.log(user.products);

            // Save the updated user to the database
            let totalAmount = 0;
            for (const product of user.products) {
                if(product.isSelected){
                const productDetails = await productmodel.findById(product.product._id);
                totalAmount += product.quantity * productDetails.price;
                }
            }
    
            user.totalamount = totalAmount;
    
            // Save the updated cart
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
   couponapply,
   removeCoupon
   
   

}


