const usermodel=require("../model/userschema")
const productmodel=require('../model/productschema')
const categorymodel=require('../model/categoryschema')
require('dotenv').config();
const  Razorpay=require("razorpay")
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
const couponmodel=require('../model/couponschema')
const walletmodel=require("../model/walletschema")


const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
const razorpayKeySecret = process.env.RAZORPAY_SECRET_KEY;

const razorpay = new Razorpay({
  key_id: razorpayKeyId,
  key_secret: razorpayKeySecret,
});











const checkoutget=async(req,res)=>{
    try{

        console.log("sdsddsddsdsdsdsds")
    let userloggedin = false;
    if(req.session && req.session.userdata){
      userloggedin=true;
    }

    const userId=req.session.userdata._id;
    const userCart = await cartmodel.findOne({ user: userId }).populate('products.product');

        const selectedProductsCount = userCart.products.filter(item => item.isSelected).length;

        if (selectedProductsCount < 1) {
            console.log("No selected products");
            req.session.message = "Please select products before proceeding to checkout.";
            return res.redirect('/cart');
        }

   console.log("userCartyyyy",userCart)
    const address=await addressModel.findOne({user:req.session.userdata});
    const coupon=await couponmodel.find({})
  
  
        
      res.render("user/checkout",{coupon,userCart,address,userloggedin})
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

        let totalAmount = 0;
        for (const product of usercart.products) {
            if(product.isSelected){
            const productDetails = await productmodel.findById(product.product._id);
            totalAmount += product.quantity * productDetails.price;
            }
        }

        usercart.totalamount = totalAmount;

        // Save the updated cart
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



        if(selectedPaymentMethod==='Wallet'){
            console.log("/////????????????????/?<<<<<<<>>>>>>>.")
            try {
                // 1. Load Wallet Information
                const wallet = await walletmodel.findOne({ user: userId });
                if (!wallet) {
                    console.log("Wallet not found for the user.")
                    return res.status(400).json({ message: 'Wallet not found for the user.' });
                  
                }
        
                // 2. Check Wallet Balance
                const selectedProducts = await cartmodel.findOne({ user: userId }).populate('products.product');
                const cartProducts = selectedProducts.products.filter((item) => item.isSelected === true);
      
                const orderTotalAmount = cartProducts.reduce((total, cartProduct) => {
                    return total + cartProduct.quantity * cartProduct.product.price;
                }, 0);
                console.log("orderTotalAmount",orderTotalAmount)
        
                if (wallet.balance < orderTotalAmount) {
                    console.log("Insufficient balance in the wallet.")
                    return res.status(400).json({ message: 'Insufficient balance in the wallet.' });
                   
                }
        
                // 3. Create Transaction
                const transaction = {
                    amount: orderTotalAmount,
                    type: 'debit',
                    description: 'Order payment',
                };
                wallet.transactions.push(transaction);
        
                // 4. Update Wallet Balance
                wallet.balance -= orderTotalAmount;
        
                // 5. Create Order
                const order = new Order({
                    userId: userId,
                    paymentMethod: 'Wallet',
                    address: {
                        name: selectedAddress.fullname,
                        mobile: selectedAddress.contact,
                        homeAddess: selectedAddress.address,
                        pincode: selectedAddress.pincode,
                        locality: selectedAddress.locality,
                        city: selectedAddress.district,
                        state: selectedAddress.state,
                        altphone: selectedAddress.altphone,
                    },// You need to handle the address data in the request body
                    products: cartProducts.map(cartProduct => ({
                        productId: cartProduct.product._id,
                        quantity: cartProduct.quantity,
                        salesPrice: cartProduct.product.price,
                        total: cartProduct.quantity * cartProduct.product.price,
                        reason: '',
                    })),
                    totalAmount: orderTotalAmount,
                });
        
                // Save changes to the database
                await wallet.save();
                await order.save();
        console.log("'Order placed successfully'")
                res.status(200).json({ message: 'Order placed successfully', order });
            } catch (error) {
                console.error('Error placing order:', error);
                res.status(500).json({ message: 'Internal server error' });
            }
        }

        

       

        if (selectedPaymentMethod === 'cod') {
            const selectedProducts = await cartmodel.findOne({ user: userId })
            
            .populate('products.product');
            console.log("selectedproductssssttthht"+selectedProducts)
            const cartProducts = selectedProducts.products.filter((item) => item.isSelected === true);
            const countOfProducts = cartProducts.length

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
                const productDetails = await productmodel.findById(cartProduct.product._id);
            
                let total;
                if (selectedProducts.couponDetails.appliedCoupon) {
                    // Coupon is applied
                    const discountPerProduct = selectedProducts.couponDetails.discountedAmount / countOfProducts;
                    total = (cartProduct.quantity * productDetails.price) - discountPerProduct;
                } else {
                    // No coupon applied
                    total = cartProduct.quantity * productDetails.price;
                }
            
                const productData = {
                    productId: cartProduct.product._id,
                    quantity: cartProduct.quantity,
                    salesPrice: productDetails.price, // Assuming productDetails contains price information
                    total: total,
                    reason: '',
                };
            
                // Do something with 'productData' (e.g., push it to an array)
            
                console.log("productData",productData)
               
                order.products.push(productData);
                order.totalAmount += productData.total;

                const product = await productmodel.findById(productData.productId);

                if (!product || product.quantity < cartProduct.quantity) {
                    return res.status(400).json({ message: 'Invalid product or insufficient quantity.' });
                }

                product.quantity -= cartProduct.quantity;
                await product.save();
            }
            if(selectedProducts.couponDetails.appliedCoupon){
                order.couponDetails.appliedCoupon=selectedProducts.couponDetails.appliedCoupon;
                order.couponDetails.discountedAmount=selectedProducts.couponDetails.discountedAmount;

                const selectcoupon=await couponmodel.findOne({couponcode:selectedProducts.couponDetails.appliedCoupon})

                if (selectcoupon) {
                    // Check if the user's ID is not already in the users_used array
                    if (!selectcoupon.users_used.includes(userId)) {
                        // If not, push the user's ID into the array
                        selectcoupon.users_used.push(userId);
            
                        // Save the changes to the coupon document
                        await selectcoupon.save();

                    }
                }





                
            }
           

                // Remove the products from the cart

    selectedProducts.products = selectedProducts.products.filter((item) => !item.isSelected);
    selectedProducts.couponDetails.appliedCoupon = null; // Set appliedCoupon to null
    selectedProducts.totalamount = 0; // Set totalamount to zero
    try {
        await selectedProducts.save();
        await order.save()
        console.log("select products",selectedProducts)
        console.log('Order placed successfully');
    } catch (error) {
        console.error('Error saving cart modifications:', error);
        res.status(500).json({ message: 'Internal Server Error' });
        return;
    }
    
    // Continue with the response
    res.status(200).json({ message: 'Order placed successfully', order });
    

         

        } else if (selectedPaymentMethod === 'razorpay') {
            const selectedProducts = await cartmodel.findOne({ user: userId })
            .populate('products.product');
            const cartProducts = selectedProducts.products.filter((item) => item.isSelected === true);
            countOfProducts=cartProducts.length

            const orderupi = new Order({
                orderId:req.params.razorpayOrderId,
                userId: userId,
                orderId:req.params.razorpayOrderId,
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

            console.log("upiiiiiiiiii"+orderupi)

            for (const cartProduct of cartProducts) {
              const   productDetails=await productmodel.findById(cartProduct.product._id);
              let total;
              if (selectedProducts.couponDetails.appliedCoupon) {
                // Coupon is applied
                const discountPerProduct = selectedProducts.couponDetails.discountedAmount / countOfProducts;
                total = (cartProduct.quantity * productDetails.price) - discountPerProduct;
            } else {
                // No coupon applied
                total = cartProduct.quantity * productDetails.price;
            }

                const productData = {
                    productId: cartProduct.product._id,
                    quantity: cartProduct.quantity,
                    salesPrice: productDetails.price,
                    total: total,
                    reason: '',
                };

                orderupi.products.push(productData);
                orderupi.totalAmount += productData.total;

                const product = await productmodel.findById(productData.productId);

                if (!product || product.quantity < cartProduct.quantity) {
                    return res.status(400).json({ message: 'Invalid product or insufficient quantity.' });
                }

                product.quantity -= cartProduct.quantity;
                await product.save();
            }
            if(selectedProducts.couponDetails.appliedCoupon){
                orderupi.couponDetails.appliedCoupon=selectedProducts.couponDetails.appliedCoupon;
                orderupi.couponDetails.discountedAmount=selectedProducts.couponDetails.discountedAmount;

                const selectcoupon=await couponmodel.findOne({couponcode:selectedProducts.couponDetails.appliedCoupon})

                if (selectcoupon) {
                    // Check if the user's ID is not already in the users_used array
                    if (!selectcoupon.users_used.includes(userId)) {
                        // If not, push the user's ID into the array
                        selectcoupon.users_used.push(userId);
            
                        // Save the changes to the coupon document
                        await selectcoupon.save();

                    }
                }





            }




           orderupi.paymentStatus="success"
           console.log("payment status change success fully")
            
            await orderupi.save();
           

            const options = {
                amount: selectedProducts.totalamount,
                currency: "INR",
                receipt: 'order_' + Date.now(),
               
            
               
            }
            console.log(options)
            

            try {
                const razorepayorder = await new Promise((resolve, reject) => {
                    razorpay.orders.create(options, (err, order) => {
                        if (err) {
                            console.error('razorepay order creation failed:', err);
                            reject(err);
                        } else {
                            resolve(order);
                        }
                    });
                });

                 // Save the Razorpay order ID in the orderId field
        orderupi.orderId = razorepayorder.id;
        // Save the order to the database
        await orderupi.save();

             
              

      

             

                console.log('Response JSON:', {
                    success: true,
                    orderId: razorepayorder.id,
                    razorepayorder,
                    key_id: razorpayKeyId,
                });
                



                // Use the 'razorpayOrder' variable here or send it in the response as needed

                res.status(200).json({ success:true,orderId:razorepayorder.id,razorepayorder,key_id:razorpayKeyId  });
           } catch (error) {
                console.error('Error creating Razorpay order:', error);
                res.status(500).json({ message: 'Internal Server Error' });
            }
        }

    } catch (error) {
        console.error('Error processing order:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const verifyrazerpay=async(req,res)=>{
    console.log("////////"+req.params.razorpayOrderId)
    
    
    const crypto=require('crypto')
    try {
        console.log(req.body);
        const{
            orderCreationId,
            razorpayPaymentId,
            razorpayOrderId,
            razorpaySignature

        }=req.body.data;
        
        
        console.log( "!!!!!!!!"+orderCreationId,razorpayPaymentId,razorpayOrderId,razorpaySignature)
        
       
            const shasum=crypto.createHmac("sha256",razorpayKeySecret);
            shasum.update(`${orderCreationId}|${razorpayPaymentId}`)

            const digest=shasum.digest('hex');

            if(digest!==razorpaySignature){
                return res.status(400).json({msg:'transaction not legit'})
            }
                
 // Find the order in your database using Razorpay order ID
 const userId=req.session.userdata._id
 console.log("userId"+userId);
 const foundOrder = await Order.findOne({ userId: userId });

   console.log("foundOrder"+foundOrder)
if (!foundOrder) {
    return res.status(404).json({ msg: 'Order not found' });
}


res.status(200).json({
    msg: "success",
    orderId: razorpayOrderId,
    paymentId: razorpayPaymentId,
    foundorder:foundOrder
});

    } catch (error) {
        console.log(error)
        res.status(500).send(error)
        
    }


}



  module.exports={
    checkoutget,
    addaddress,
    deleteaddress,
    selectionbox,
    addresspaymentmethod,
    verifyrazerpay


  }